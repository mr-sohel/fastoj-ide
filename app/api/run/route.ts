import { NextResponse } from 'next/server';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

async function runProcess(cmd: string, args: string[], options: { cwd?: string; input?: string; timeLimitMs?: number }) {
  return new Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }>((resolve) => {
    const child = spawn(cmd, args, { cwd: options.cwd, shell: false });

    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;

    const timeLimit = options.timeLimitMs ?? 4000;
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch {}
    }, timeLimit);

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: stderr + String(err), timedOut });
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });

    if (options.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const source: string = body.code ?? '';
    const stdin: string = body.stdin ?? '';
    const timeLimitMs: number = Math.min(Math.max(Number(body.timeLimitMs) || 4000, 500), 20000);

    if (!source || typeof source !== 'string') {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const base = await fs.mkdtemp(path.join(tmpdir(), 'cpp-run-'));
    const srcPath = path.join(base, 'main.cpp');
    const exePath = path.join(base, process.platform === 'win32' ? 'a.exe' : 'a.out');

    await fs.writeFile(srcPath, source, 'utf8');

    // Compile
    const compile = await runProcess('g++', ['-std=c++20', '-O2', srcPath, '-o', exePath], { cwd: base, timeLimitMs: 15000 });
    if (compile.code !== 0) {
      // Provide a clearer message if g++ is missing
      const missing = /spawn g\+\+ ENOENT/.test(compile.stderr) ? 'g++ not found in PATH' : '';
      const msg = missing ? `${missing}. Install MinGW-w64 and ensure g++ is in PATH.` : compile.stderr;
      return NextResponse.json({
        stdout: '',
        stderr: '',
        compile_output: msg || 'Compilation failed',
        status: { id: 6, description: 'Compilation Error' },
      }, { status: 200 });
    }

    // Run
    const run = await runProcess(exePath, [], { cwd: base, input: stdin, timeLimitMs });

    let status = { id: 3, description: 'Accepted' };
    if (run.timedOut) {
      status = { id: 5, description: 'Time Limit Exceeded' };
    } else if (run.code !== 0) {
      status = { id: 4, description: 'Runtime Error' };
    }

    return NextResponse.json({
      stdout: run.stdout,
      stderr: run.stderr,
      compile_output: '',
      status,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
