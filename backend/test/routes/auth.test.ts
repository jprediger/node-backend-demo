import * as assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import Fastify from 'fastify';
import type { PrismaClient } from '@prisma/client';

import authRoutes from '../../src/modules/auth';
import jwtPlugin from '../../src/plugins/jwt';
import usersRoutes from '../../src/modules/users';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

type MockUser = {
  id: string;
  email: string;
  password: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function buildPrismaMock(users: Map<string, MockUser>) {
  return {
    user: {
      findUnique: async ({
        where,
      }: {
        where: { email?: string; id?: string };
      }) => {
        if (where.email) {
          return (
            Array.from(users.values()).find((u) => u.email === where.email) ??
            null
          );
        }

        if (where.id) {
          return users.get(where.id) ?? null;
        }

        return null;
      },
      create: async ({
        data,
      }: {
        data: { email: string; password: string; name?: string };
      }) => {
        const now = new Date();
        const user: MockUser = {
          id: randomUUID(),
          email: data.email,
          password: data.password,
          name: data.name,
          createdAt: now,
          updatedAt: now,
        };

        users.set(user.id, user);
        return user;
      },
    },
  };
}

async function buildApp(t: TestContext) {
  const users = new Map<string, MockUser>();
  const prismaMock = buildPrismaMock(users);

  const app = Fastify();
  app.decorate('prisma', prismaMock as any);
  await app.register(jwtPlugin);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });
  app.get('/private', { onRequest: [app.authenticate] }, async (request) => ({
    user: request.user,
  }));

  await app.ready();
  t.after(async () => app.close());

  return { app, users };
}

test('auth: register returns token + user (email lowercased, no password)', async (t) => {
  process.env.JWT_SECRET = 'test-secret';
  const { app } = await buildApp(t);

  const registerRes = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      email: 'TEST@EXAMPLE.COM',
      password: 'secret123',
      name: 'Alice',
    },
  });

  assert.equal(registerRes.statusCode, 201);
  const registerBody = registerRes.json() as {
    token: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      password?: unknown;
    };
  };
  assert.ok(registerBody.token);
  assert.equal(registerBody.user.email, 'test@example.com');
  assert.equal(registerBody.user.name, 'Alice');
  assert.equal('password' in registerBody.user, false);
});

test('auth: register validates payload via Zod (400 with issues)', async (t) => {
  process.env.JWT_SECRET = 'test-secret';
  const { app } = await buildApp(t);

  const badEmail = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'not-an-email', password: 'secret123' },
  });

  assert.equal(badEmail.statusCode, 400);
  const badEmailBody = badEmail.json() as {
    message: string;
    issues: Array<{ path: string; message: string }>;
  };
  assert.equal(badEmailBody.message, 'Dados inválidos');
  assert.ok(badEmailBody.issues.some((i) => i.path === 'email'));

  const shortPassword = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'ok@example.com', password: '123' },
  });

  assert.equal(shortPassword.statusCode, 400);
  const shortPasswordBody = shortPassword.json() as {
    message: string;
    issues: Array<{ path: string; message: string }>;
  };
  assert.equal(shortPasswordBody.message, 'Dados inválidos');
  assert.ok(shortPasswordBody.issues.some((i) => i.path === 'password'));
});

test('auth: register rejects duplicate emails (400)', async (t) => {
  process.env.JWT_SECRET = 'test-secret';
  const { app } = await buildApp(t);

  const first = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'dup@example.com', password: 'secret123' },
  });
  assert.equal(first.statusCode, 201);

  const second = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'dup@example.com', password: 'secret123' },
  });
  assert.equal(second.statusCode, 400);
  assert.deepStrictEqual(second.json(), { message: 'User already exists' });
});

test('auth: login works + invalid credentials returns 401', async (t) => {
  process.env.JWT_SECRET = 'test-secret';
  const { app } = await buildApp(t);

  await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'login@example.com', password: 'secret123' },
  });

  const loginRes = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'LOGIN@EXAMPLE.COM', password: 'secret123' },
  });

  assert.equal(loginRes.statusCode, 200);
  const loginBody = loginRes.json() as {
    token: string;
    user: { id: string; email: string; password?: unknown };
  };
  assert.ok(loginBody.token);
  assert.equal(loginBody.user.email, 'login@example.com');
  assert.equal('password' in loginBody.user, false);

  const wrongPassword = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'login@example.com', password: 'wrong' },
  });
  assert.equal(wrongPassword.statusCode, 401);
  assert.deepStrictEqual(wrongPassword.json(), {
    message: 'Invalid credentials',
  });

  const unknownEmail = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'unknown@example.com', password: 'secret123' },
  });
  assert.equal(unknownEmail.statusCode, 401);
  assert.deepStrictEqual(unknownEmail.json(), {
    message: 'Invalid credentials',
  });
});

test('auth: protected routes require Bearer token and set request.user', async (t) => {
  process.env.JWT_SECRET = 'test-secret';
  const { app } = await buildApp(t);

  await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'guard@example.com', password: 'secret123' },
  });

  const loginRes = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'guard@example.com', password: 'secret123' },
  });
  const { token } = loginRes.json() as { token: string };

  const protectedRes = await app.inject({
    method: 'GET',
    url: '/private',
    headers: { authorization: `Bearer ${token}` },
  });

  assert.equal(protectedRes.statusCode, 200);
  const protectedBody = protectedRes.json() as {
    user: { id: string; email: string };
  };
  assert.equal(protectedBody.user.email, 'guard@example.com');

  const missingAuth = await app.inject({ method: 'GET', url: '/private' });
  assert.equal(missingAuth.statusCode, 401);
  assert.deepStrictEqual(missingAuth.json(), { message: 'Unauthorized' });

  const invalidToken = await app.inject({
    method: 'GET',
    url: '/private',
    headers: { authorization: 'Bearer not-a-real-token' },
  });
  assert.equal(invalidToken.statusCode, 401);
  assert.deepStrictEqual(invalidToken.json(), { message: 'Unauthorized' });
});

test('auth: JWT can access /users/me (protected route)', async (t) => {
  process.env.JWT_SECRET = 'test-secret';
  const { app } = await buildApp(t);

  const registerRes = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: 'me@example.com', password: 'secret123' },
  });
  const { token, user } = registerRes.json() as {
    token: string;
    user: { id: string; email: string };
  };

  const meRes = await app.inject({
    method: 'GET',
    url: '/users/me',
    headers: { authorization: `Bearer ${token}` },
  });

  assert.equal(meRes.statusCode, 200);
  const meBody = meRes.json() as {
    id: string;
    email: string;
    password?: unknown;
  };
  assert.equal(meBody.id, user.id);
  assert.equal(meBody.email, 'me@example.com');
  assert.equal('password' in meBody, false);
});
