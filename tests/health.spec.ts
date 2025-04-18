import { buildServer } from '../src/server';

import type { FastifyInstance } from 'fastify';

let server: FastifyInstance;

beforeAll(async () => {
  server = await buildServer();
});

afterAll(async () => {
  await server.close();
});

describe('system routes', () => {
  it('GET /healthz should return ok', async () => {
    const res = await server.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});
