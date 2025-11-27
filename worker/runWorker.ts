import { Worker, JobsOptions } from 'bullmq';
import { RUN_QUEUE_NAME, connection } from '../lib/bullmq';
import { runCppInDocker } from '../lib/dockerRunner';

const CONCURRENCY = parseInt(process.env.BULLMQ_CONCURRENCY || '1', 10) || 1;

async function main() {
  // Worker that processes run jobs and returns the execution result
  const worker = new Worker(
    RUN_QUEUE_NAME,
    async (job) => {
      console.log(`[Worker] Job ${job.id} - Starting execution`);
      const { code, input } = job.data as { code: string; input: string; language?: string };
      console.log(`[Worker] Job ${job.id} - Code length: ${code?.length || 0}, Input length: ${input?.length || 0}`);
      
      try {
        // Execute inside Docker with existing safety limits implemented in runCppInDocker
        const result = await runCppInDocker(code || '', input || '');
        console.log(`[Worker] Job ${job.id} - Result:`, JSON.stringify(result).substring(0, 200));
        return result; // stored as job.returnvalue
      } catch (err: any) {
        console.error(`[Worker] Job ${job.id} - Error:`, err.message);
        throw err;
      }
    },
    { connection, concurrency: CONCURRENCY }
  );

  worker.on('ready', () => console.log(`[Worker] Ready on ${RUN_QUEUE_NAME} (concurrency=${CONCURRENCY})`));
  worker.on('completed', (job) => console.log(`[Worker] Completed job ${job.id}`));
  worker.on('failed', (job, err) => console.error(`[Worker] Failed job ${job?.id}:`, err?.message));
  worker.on('error', (err) => console.error('[Worker] Error:', err));
  worker.on('active', (job) => console.log(`[Worker] Processing job ${job.id}`));
}

main().catch((e) => {
  console.error('[Worker] Fatal:', e);
  process.exit(1);
});
