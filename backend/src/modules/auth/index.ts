import { FastifyPluginAsync } from 'fastify';

import { authController } from './controller';
import { authRepository } from './repository';
import { authService } from './service';

const authModule: FastifyPluginAsync = async (fastify) => {
  const repo = authRepository(fastify.prisma);
  const service = authService({ repo });
  const controller = authController({
    service,
    signAccessToken: fastify.signAccessToken,
  });

  fastify.post('/register', controller.register);
  fastify.post('/login', controller.login);
};

export default authModule;
