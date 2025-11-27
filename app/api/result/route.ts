import { NextResponse, NextRequest } from 'next/server';
import { getRunQueue } from '@/lib/bullmq';

export const runtime = 'nodejs';

// GET /api/result?jobId=xxxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const queue = getRunQueue();
  const job = await queue.getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const state = await job.getState();
  
  // Access return value from job data
  let result = undefined;
  let error = undefined;
  
  if (state === 'completed') {
    result = await job.returnvalue;
  } else if (state === 'failed') {
    error = job.failedReason;
  }

  return NextResponse.json({
    jobId,
    state,
    result,
    error,
  });
}
