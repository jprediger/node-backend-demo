import { FastifyPluginAsync } from 'fastify';

import { usersController } from './controller';
import { usersRepository } from './repository';
import { usersService } from './service';

const usersModule: FastifyPluginAsync = async (fastify) => {
  const repo = usersRepository(fastify.prisma);
  const service = usersService({ repo });
  const controller = usersController({ service });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, controller.me);
};

export default usersModule;
