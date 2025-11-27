export interface RunResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: { id: number; description: string };
  time?: string;
  memory?: number;
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
