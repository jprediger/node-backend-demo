import fp from 'fastify-plugin';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

type JwtUser = {
  id: string;
  email: string;
};

declare module 'fastify' {
  interface FastifyInstance {
    signAccessToken: (user: JwtUser) => string;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user: JwtUser;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string };
    user: JwtUser;
  }
}

const jwtPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '1h';

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const jwtOptions: FastifyJWTOptions = {
      secret,
      sign: { expiresIn },
    };

    await fastify.register(fastifyJwt, jwtOptions);

    fastify.decorate('signAccessToken', (user: JwtUser) =>
      fastify.jwt.sign({ sub: user.id, email: user.email })
    );

    fastify.decorate(
      'authenticate',
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const payload = await request.jwtVerify<{
            sub: string;
            email: string;
          }>();
          request.user = { id: payload.sub, email: payload.email };
        } catch {
          reply.code(401);
          return reply.send({ message: 'Unauthorized' });
        }
      }
    );
  },
  { name: 'jwt-plugin' }
);

export default jwtPlugin;
