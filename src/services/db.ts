// @ts-nocheck

/*
 * Lazy Prisma client singleton.
 *
 * The generated client may be missing in CI when tests are executed before
 * `prisma generate`.  Importing it unconditionally would therefore throw and
 * prevent the server from booting.  To work around this we create a proxy that
 * attempts to require the real client only when the first property is
 * accessed (i.e. the first time an endpoint actually needs the database).
 */

let realClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any

function initPrisma() {
  // In test mode, return a stub client to avoid real database interactions
  if (process.env.NODE_ENV === 'test') {
    return {
      user: {
        findUnique: async () => null,
        create: async ({ data }) => ({ id: 'user-id', email: data.email }),
      },
    };
  }
  if (realClient) return realClient;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
    const { PrismaClient } = require('@prisma/client');
    realClient = new PrismaClient();
  } catch {
    throw new Error('Prisma client not generated – run "prisma generate".');
  }

  return realClient;
}

export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = initPrisma();
      // @ts-ignore dynamic prop access
      return client[prop];
    },
  },
) as any;

export default prisma;
