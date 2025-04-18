import { Queue } from 'bullmq';

let queueInstance: Queue | null = null;

if (process.env.NODE_ENV === 'test') {
  // Provide a stub no‑op queue during tests to avoid Redis dependency
  queueInstance = {
    add: async () => ({ id: 'test-job' }),
    getJob: async () => null,
  } as unknown as Queue;
} else {
  const connection: any = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  };

  queueInstance = new Queue('ocr', {
    connection,
    defaultJobOptions: {
      removeOnComplete: {
        age: 60 * 60 * 24 * 7, // 7 days in seconds
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 7,
      },
    },
  });
}

export const ocrQueue = queueInstance;
