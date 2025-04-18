import type { FastifyInstance } from 'fastify';

import { uploadStatement } from '../services/s3.js';
import { ocrQueue } from '../services/queue.js';

export default async function statementsRoutes(server: FastifyInstance) {


  server.post('/api/v1/statements/upload', {
    preHandler: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ message: 'Unauthorized' });
      }
    }],
    schema: {
      consumes: ['multipart/form-data'],
      response: {
        202: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
          },
          required: ['jobId'],
        },
      },
      required: [],
    },
    // 10MB file limit
    onRequest: async (request, reply) => {
      if (!request.isMultipart()) {
        reply.code(400).send({ message: 'Expected multipart/form-data' });
      }
    },
  }, async (request, reply) => {
    const user = request.user as { sub: string };

    const parts = request.parts();
    const part = await parts.next();
    if (!part || part.done || !part.value) {
      return reply.code(400).send({ message: 'File not provided' });
    }

    const file = part.value;

    if (file.type !== 'file') {
      return reply.code(400).send({ message: 'Invalid multipart field' });
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return reply.code(400).send({ message: 'Unsupported mime type' });
    }

    const buffer = await file.toBuffer();

    if (buffer.length > 10 * 1024 * 1024) {
      return reply.code(400).send({ message: 'File exceeds 10MB limit' });
    }

    const objectKey = await uploadStatement(user.sub, {
      buffer,
      filename: file.filename,
      mimetype: file.mimetype,
      size: buffer.length,
    });

    const job = await ocrQueue.add('parse-statement', {
      userId: user.sub,
      s3Key: objectKey,
    });

    reply.code(202).send({ jobId: job.id });
  });
}
