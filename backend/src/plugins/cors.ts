import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(
  async (fastify) => {
    await fastify.register(cors, {
      origin: [
        'https://elegant-endurance-production.up.railway.app',
        'http://localhost:5173',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  },
  {
    name: 'cors',
  }
);
