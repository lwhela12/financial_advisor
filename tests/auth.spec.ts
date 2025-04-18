import { buildServer } from '../src/server.js';
import type { FastifyInstance } from 'fastify';

describe('auth routes', () => {
  let server: FastifyInstance;
  beforeAll(async () => {
    server = await buildServer();
  });
  afterAll(async () => {
    await server.close();
  });

  it('POST /api/v1/auth/signup returns token and sets cookie', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      payload: { email: 'test@example.com', password: 'password123' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('token');
    const setCookie = res.headers['set-cookie'];
    // Should have a Set-Cookie header for the refresh token
    expect(setCookie).toBeDefined();
    if (Array.isArray(setCookie)) {
      expect(setCookie[0]).toMatch(/^refresh=/);
    } else {
      expect(setCookie).toMatch(/^refresh=/);
    }
  });
});