export interface RunResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: { id: number; description: string };
  time?: string;
  memory?: number;
}

// Calls local Next.js API route with BullMQ: submit job, poll for result
export async function runCppLocal(source_code: string, stdin: string): Promise<RunResult> {
  // Submit job to queue
  const submitRes = await fetch('/api/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code: source_code, stdin }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text().catch(() => '');
    throw new Error(`Job submission failed: ${submitRes.status} ${text}`);
  }

  const { jobId } = await submitRes.json();
  if (!jobId) throw new Error('No jobId returned');

  // Poll for result
  const maxAttempts = 60; // 30 seconds max (500ms * 60)
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const resultRes = await fetch(`/api/result?jobId=${jobId}`);
    if (!resultRes.ok) continue;
    
    const data = await resultRes.json();
    if (data.state === 'completed' && data.result) {
      return {
        stdout: data.result.stdout || '',
        stderr: data.result.stderr || '',
        compile_output: data.result.compile_output || '',
        status: data.result.status || { id: 0, description: 'Unknown' },
        time: data.result.time,
        memory: data.result.memory,
      };
    } else if (data.state === 'failed') {
      throw new Error(data.error || 'Job failed');
    }
  }
  
  throw new Error('Job timed out waiting for result');
}
