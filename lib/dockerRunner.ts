import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export interface DockerRunResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: { id: number; description: string };
  time?: string;
  memory?: number;
}

// Safety: Maximum output size in bytes (50KB)
const MAX_OUTPUT_SIZE = 50 * 1024;
const TRUNCATION_MESSAGE = '\n[output truncated — exceeded 50KB limit]';

function truncateOutput(text: string, maxBytes: number): string {
  const buffer = Buffer.from(text, 'utf8');
  if (buffer.length <= maxBytes) {
    return text;
  }
  const truncated = buffer.subarray(0, maxBytes - Buffer.byteLength(TRUNCATION_MESSAGE, 'utf8'));
  return truncated.toString('utf8') + TRUNCATION_MESSAGE;
}

function spawnCapture(cmd: string, args: string[], opts: { timeoutMs?: number } = {}) {
  return new Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }>((resolve) => {
    const child = spawn(cmd, args, { shell: false });
    let stdout = '';
    let stderr = '';
    let finished = false;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch {}
    }, opts.timeoutMs ?? 20000);
    child.stdout.on('data', d => (stdout += d.toString()));
    child.stderr.on('data', d => (stderr += d.toString()));
    child.on('error', err => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      stderr += String(err);
      resolve({ code: -1, stdout, stderr, timedOut });
    });
    child.on('close', code => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}

export async function runCppInDocker(source: string, stdin: string): Promise<DockerRunResult> {
  let base = '';
  try {
    base = await fs.mkdtemp(path.join(tmpdir(), 'cpp-dkr-'));
    const srcPath = path.join(base, 'main.cpp');
    const inputPath = path.join(base, 'input.txt');
    await fs.writeFile(srcPath, source, 'utf8');
    await fs.writeFile(inputPath, stdin ?? '', 'utf8');
  } catch (err: any) {
    return {
      stdout: '',
      stderr: '',
      compile_output: `Failed to prepare temp files: ${err.message}`,
      status: { id: 6, description: 'Compilation Error' }
    };
  }

  const volumePath = process.platform === 'win32' ? base.replace(/\\/g, '/') : base;
  
  // Safety: Bash script with hard limits, output truncation, and time/memory measurement
  const script = `
g++ -std=c++20 main.cpp -O2 -o a.out 2> compile_errors.txt
if [ -f a.out ]; then
  # Safety: 2-second hard timeout with accurate time/memory measurement using /usr/bin/time
  # Format: %e = elapsed real time in seconds, %M = maximum resident set size in KB
  START_MS=$(date +%s%3N)
  
  # Use /usr/bin/time to capture accurate memory usage
  timeout 2s /usr/bin/time -f "%M" -o mem_usage.txt ./a.out < input.txt > program_stdout_raw.txt 2> program_stderr_raw.txt
  EXIT_CODE=$?
  
  END_MS=$(date +%s%3N)
  
  # Calculate elapsed time in milliseconds
  ELAPSED_MS=$((END_MS - START_MS))
  
  # Convert milliseconds to seconds with proper decimal formatting
  if [ $ELAPSED_MS -lt 10 ]; then
    ELAPSED_SEC="0.00$ELAPSED_MS"
  elif [ $ELAPSED_MS -lt 100 ]; then
    ELAPSED_SEC="0.0$ELAPSED_MS"
  elif [ $ELAPSED_MS -lt 1000 ]; then
    ELAPSED_SEC="0.$ELAPSED_MS"
  else
    SEC=$((ELAPSED_MS / 1000))
    MS=$((ELAPSED_MS % 1000))
    # Pad milliseconds to 3 digits
    if [ $MS -lt 10 ]; then
      ELAPSED_SEC="$SEC.00$MS"
    elif [ $MS -lt 100 ]; then
      ELAPSED_SEC="$SEC.0$MS"
    else
      ELAPSED_SEC="$SEC.$MS"
    fi
  fi
  
  # Get accurate memory usage from /usr/bin/time output (in KB)
  MEMORY=$(cat mem_usage.txt 2>/dev/null | tr -d ' ' || echo "1024")
  if [ -z "$MEMORY" ] || [ "$MEMORY" = "0" ]; then
    MEMORY="1024"
  fi
  
  echo "$ELAPSED_SEC $MEMORY" > time_mem.txt
  
  # Truncate output files to 50KB max
  head -c 51200 program_stdout_raw.txt > program_stdout.txt 2>/dev/null || touch program_stdout.txt
  head -c 51200 program_stderr_raw.txt > program_stderr.txt 2>/dev/null || touch program_stderr.txt
  
  echo $EXIT_CODE > exit_code.txt
else
  echo 1 > exit_code.txt
fi
`;

  // Safety: Docker resource limits
  const args = [
    'run',
    '--rm',                    // Remove container after execution
    '--network', 'none',       // Disable all network access
    '--memory=256m',           // Limit memory to 256MB
    '--cpus=1.0',              // Limit to 1 CPU core
    '--pids-limit=50',         // Limit process count
    '--ulimit', 'nofile=100',  // Limit file descriptors
    '-v', `${volumePath}:/run`,
    'fastoj-gcc', 'bash', '-c', script
  ];

  let runResult;
  try {
    runResult = await spawnCapture('docker', args, { timeoutMs: 15000 });
    if (/Unable to find image/.test(runResult.stderr) || /No such image/.test(runResult.stderr)) {
      args[args.indexOf('fastoj-gcc')] = 'gcc:latest';
      runResult = await spawnCapture('docker', args, { timeoutMs: 15000 });
    }
    if (runResult.code !== 0 && /Cannot connect to the Docker daemon/i.test(runResult.stderr)) {
      return {
        stdout: '',
        stderr: '',
        compile_output: 'Docker daemon unavailable. Please start Docker Desktop.',
        status: { id: 6, description: 'Compilation Error' }
      };
    }
  } catch (err: any) {
    try { await fs.rm(base, { recursive: true, force: true }); } catch {}
    return {
      stdout: '',
      stderr: '',
      compile_output: `Docker execution failed: ${err.message}`,
      status: { id: 6, description: 'Compilation Error' }
    };
  }

  let compile_output = '';
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  let executionTime: string | undefined;
  let memoryUsed: number | undefined;
  
  try {
    // Parallel file reads for better performance
    const [compileOut, stdOut, stdErr, exitRaw, timeMem] = await Promise.all([
      fs.readFile(path.join(base, 'compile_errors.txt'), 'utf8').catch(() => ''),
      fs.readFile(path.join(base, 'program_stdout.txt'), 'utf8').catch(() => ''),
      fs.readFile(path.join(base, 'program_stderr.txt'), 'utf8').catch(() => ''),
      fs.readFile(path.join(base, 'exit_code.txt'), 'utf8').catch(() => '1'),
      fs.readFile(path.join(base, 'time_mem.txt'), 'utf8').catch(() => '')
    ]);

    exitCode = parseInt(exitRaw.trim(), 10) || 0;

    // Parse time and memory measurements
    if (timeMem) {
      const parts = timeMem.trim().split(/\s+/);
      if (parts.length >= 2) {
        executionTime = parts[0];
        memoryUsed = parseInt(parts[1], 10) || 0;
      }
    }

    // Safety: Truncate outputs if they exceed limit
    compile_output = truncateOutput(compileOut, MAX_OUTPUT_SIZE);
    stdout = truncateOutput(stdOut, MAX_OUTPUT_SIZE);
    stderr = truncateOutput(stdErr, MAX_OUTPUT_SIZE);
  } finally {
    // Safety: Always cleanup temp files to prevent disk space abuse
    try { await fs.rm(base, { recursive: true, force: true }); } catch {}
  }

  if (compile_output.trim().length > 0) {
    return {
      stdout: '',
      stderr: '',
      compile_output,
      status: { id: 6, description: 'Compilation Error' },
      time: executionTime,
      memory: memoryUsed
    };
  }

  if (exitCode === 124) {
    return {
      stdout,
      stderr,
      compile_output: '',
      status: { id: 5, description: 'Time Limit Exceeded' },
      time: executionTime,
      memory: memoryUsed
    };
  }

  if (exitCode !== 0) {
    return {
      stdout,
      stderr,
      compile_output: '',
      status: { id: 4, description: 'Runtime Error' },
      time: executionTime,
      memory: memoryUsed
    };
  }

  return {
    stdout,
    stderr,
    compile_output: '',
    status: { id: 3, description: 'Accepted' },
    time: executionTime,
    memory: memoryUsed
  };
}
