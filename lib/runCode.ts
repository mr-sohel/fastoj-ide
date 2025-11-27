export interface RunResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: { id: number; description: string };
  time?: string;
  memory?: number;
}

// Uses Judge0 (RapidAPI) to run C++ code. Requires NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY.
export async function runCppWithJudge0(source_code: string, stdin: string): Promise<RunResult> {
  const apiKey = process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY;
  const host = process.env.NEXT_PUBLIC_JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY');
  }

  const url = `https://${host}/submissions?base64_encoded=false&wait=true`;

  const payload = {
    language_id: 54, // C++ (GCC 9.2.0) C++17
    source_code,
    stdin,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': host,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Judge0 request failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  // data contains stdout, stderr, compile_output possibly null
  const result: RunResult = {
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compile_output: data.compile_output || '',
    status: data.status || { id: 0, description: 'Unknown' },
    time: data.time,
    memory: data.memory,
  };

  return result;
}

// Calls local Next.js API route to compile and run with g++ on the host.
export async function runCppLocal(source_code: string, stdin: string): Promise<RunResult> {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code: source_code, stdin }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Local run failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const result: RunResult = {
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compile_output: data.compile_output || '',
    status: data.status || { id: 0, description: 'Unknown' },
  };
  return result;
}
