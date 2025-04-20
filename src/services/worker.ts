import { Worker } from 'bullmq';
import prisma from './db.js';
import { s3 } from './s3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';
import { spawnSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Use the same Redis connection as the queue
// Redis connection options (cast to any to satisfy bullmq types)
const connection: any = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

// Only start the worker outside of tests
if (process.env.NODE_ENV !== 'test') {
  const worker = new Worker(
    'ocr',
    async (job) => {
      const { s3Key } = job.data as { s3Key: string; userId: string };
      // Perform OCR: download from S3
      console.log(`OCR processing for ${s3Key}`);
      const getObj = await s3.send(
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: s3Key })
      );
      const chunks: Uint8Array[] = [];
      for await (const chunk of getObj.Body as any) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const buffer = Buffer.concat(chunks);
      let texts: string[];
      if (process.env.USE_TESSERACT === '1') {
        // Fallback OCR via Tesseract CLI
        const tmpFile = path.join(os.tmpdir(), `${job.id}.pdf`);
        await fs.writeFile(tmpFile, buffer);
        const result = spawnSync('tesseract', [tmpFile, 'stdout']);
        texts = [result.stdout.toString('utf8')];
      } else {
        // Use AWS Textract synchronous API
        const client = new TextractClient({});
        const cmd = new DetectDocumentTextCommand({ Document: { Bytes: buffer } });
        const resp = await client.send(cmd);
        const lines = (resp.Blocks || [] as any[])
          .filter((b: any) => b.BlockType === 'LINE' && b.Text)
          .map((b: any) => b.Text as string);
        texts = [lines.join('\n')];
      }
      // Compute pages and symbol occurrences
      const pages = texts.length;
      const symbolsFound = texts.reduce(
        (sum, t) => sum + (t.match(/\$?\d[\d,]*\.?\d*/g) || []).length,
        0
      );
      // Upsert parsed assets
      for (const text of texts) {
        for (const line of text.split(/\r?\n/)) {
          const m = line.trim().match(/(.+?)\s+\$?([\d,]+\.?\d{2})$/);
          if (!m) continue;
          const name = m[1].trim();
          const value = parseFloat(m[2].replace(/,/g, ''));
          const existing = await prisma.asset.findFirst({ where: { userId: job.data.userId as string, name } });
          if (existing) {
            await prisma.asset.update({ where: { id: existing.id }, data: { value } });
          } else {
            await prisma.asset.create({ data: { userId: job.data.userId as string, name, type: 'Other', value } });
          }
        }
      }
      // Mark job succeeded with metadata
      await prisma.job.update({
        where: { id: job.id!.toString() },
        data: { status: 'succeeded', pages, symbolsFound },
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