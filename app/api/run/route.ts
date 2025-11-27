import { NextResponse } from 'next/server';
import { getRunQueue } from '@/lib/bullmq';

export const runtime = 'nodejs';

// Now uses BullMQ: enqueue run job, return jobId
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const source: string = body.code ?? '';
    // Accept both `stdin` (existing client) and `input` (new spec)
    const stdin: string = body.stdin ?? body.input ?? '';

    if (!source || typeof source !== 'string') {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const queue = getRunQueue();
    const job = await queue.add('execute_cpp', {
      code: source,
      input: stdin,
      language: 'cpp',
    }, {
      removeOnComplete: 60000, // Keep for 60 seconds
      removeOnFail: 60000,
    });

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (err: any) {
    console.error('[API] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
