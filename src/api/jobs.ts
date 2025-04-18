import type { FastifyInstance } from 'fastify';

import { ocrQueue } from '../services/queue.js';

export default async function jobsRoutes(server: FastifyInstance) {
  server.get('/api/v1/jobs/:id', {
    preHandler: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ message: 'Unauthorized' });
      }
    }],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'succeeded', 'failed'],
            },
            error: { type: 'string' },
          },
          required: ['status'],
        },
      },
      required: [],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const job = await ocrQueue.getJob(id);
    if (!job) {
      return reply.code(404).send({ message: 'Job not found' });
    }

    const state = await job.getState();

    return reply.send({ status: state as any, error: job.failedReason ?? undefined });
  });
}
