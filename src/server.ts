import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import prisma from './services/db.js';

// Route modules
import statementsRoutes from './api/statements.js';
import jobsRoutes from './api/jobs.js';

dotenv.config();

function createLogger() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return true;

  return {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  } as const;
}

export async function buildServer(): Promise<FastifyInstance> {
  const server: FastifyInstance = Fastify({
    logger: createLogger(),
  });

  // ---------------- Plugins ----------------
  await server.register(helmet);
  await server.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'supersecret',
  });

  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'changeme',
    sign: { expiresIn: '60m' },
    cookie: {
      cookieName: 'refresh',
      signed: false,
    },
  });

  await server.register(swagger, {
    openapi: {
      info: { title: 'Pocket Financial Advisor API', version: '0.1.0' },
    },
  });

  await server.register(swaggerUi, { routePrefix: '/docs' });

  await server.register(multipart, {
    attachFieldsToBody: false,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // ---------------- Schemas ----------------
  const StatusSchema = {
    type: 'object',
    properties: {
      status: { type: 'string' },
    },
    required: ['status'],
  } as const;

  server.get('/healthz', {
    schema: {
      tags: ['system'],
      response: { 200: StatusSchema },
    },
  }, async () => ({ status: 'ok' }));

  server.get('/readyz', {
    schema: {
      tags: ['system'],
      response: { 200: StatusSchema },
    },
  }, async () => ({ status: 'ready' }));

  // Auth routes ----------------------------

  // Using Zod for type inference but Fastify routes use JSON Schema for validation
  const SignupLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
  });

  const SignupLoginBodySchema = {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 128 },
    },
    required: ['email', 'password'],
  } as const;

  const TokenResponseSchema = {
    type: 'object',
    properties: {
      token: { type: 'string' },
    },
    required: ['token'],
  } as const;

  server.post('/api/v1/auth/signup', {
    schema: {
      tags: ['auth'],
      body: SignupLoginBodySchema,
      response: { 200: TokenResponseSchema },
      required: [],
    },
  }, async (request, reply) => {
    const { email, password } = request.body as z.infer<typeof SignupLoginSchema>;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const token = server.jwt.sign({ sub: user.id, email });

    reply.setCookie('refresh', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
    });

    return { token };
  });

  server.post('/api/v1/auth/login', {
    schema: {
      tags: ['auth'],
      body: SignupLoginBodySchema,
      response: { 200: TokenResponseSchema },
      required: [],
    },
  }, async (request, reply) => {
    const { email, password } = request.body as z.infer<typeof SignupLoginSchema>;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    const token = server.jwt.sign({ sub: user.id, email: user.email });

    reply.setCookie('refresh', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
    });

    return { token };
  });

  server.get('/api/v1/auth/me', {
    preHandler: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.send(err);
      }
    }],
    schema: {
      tags: ['auth'],
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
          required: ['userId', 'email'],
        },
      },
      required: [],
    },
  }, async (request) => {
    const { sub, email } = request.user as { sub: string; email: string };
    return { userId: sub, email };
  });

  // Domain routes
  await server.register(statementsRoutes);
  await server.register(jobsRoutes);

  return server;
}

// If not in test mode, start server immediately
if (process.env.NODE_ENV !== 'test') {
  // Start the OCR worker
  import('./services/worker.js').catch((err) => {
    console.error('Failed to start OCR worker:', err);
  });

  // Start the API server
  buildServer().then((server) => {
    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen({ port, host: '0.0.0.0' })
      .catch((err) => {
        server.log.error(err);
        process.exit(1);
      });
  });
}
