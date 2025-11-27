import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const RUN_QUEUE_NAME = 'runQueue';

// Parse Redis URL or use default connection
function getRedisConnection() {
  if (REDIS_URL.startsWith('redis://')) {
    try {
      const url = new URL(REDIS_URL);
      return {
        host: url.hostname || '127.0.0.1',
        port: url.port ? parseInt(url.port, 10) : 6379,
      };
    } catch {
      return { host: '127.0.0.1', port: 6379 };
    }
  }
  return { host: '127.0.0.1', port: 6379 };
}

export const connection = getRedisConnection();

let queue: Queue | undefined;
export function getRunQueue() {
  if (!queue) queue = new Queue(RUN_QUEUE_NAME, { connection });
  return queue;
}
