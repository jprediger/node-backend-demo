import { FastifyPluginAsync } from 'fastify';

const rootModule: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', async () => {
    return { root: true };
  });
};

export default rootModule;
