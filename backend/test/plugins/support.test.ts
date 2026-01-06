import * as assert from 'node:assert';
import { test } from 'node:test';

import Fastify from 'fastify';

import Support from '../../src/plugins/support';

void test('support works standalone', async (_t) => {
  const fastify = Fastify();

  await fastify.register(Support);
  await fastify.ready();

  assert.equal(fastify.someSupport(), 'hugs');
});
