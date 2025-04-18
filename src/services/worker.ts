import { Worker } from 'bullmq';
import prisma from './db.js';

// Use the same Redis connection as the queue
// Redis connection options (cast to any to satisfy bullmq types)
const connection: any = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

// Only start the worker outside of tests
if (process.env.NODE_ENV !== 'test') {
  const worker = new Worker(
    'ocr',
    async (job) => {
      const { s3Key } = job.data as { s3Key: string; userId: string };
      // Stub OCR processing
      console.log(`TODO: OCR ${s3Key}`);
      // Mark job as succeeded in the database
      await prisma.job.update({
        where: { id: job.id!.toString() },
        data: { status: 'succeeded' },
      });
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`OCR job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`OCR job ${job?.id} failed:`, err);
  });
}