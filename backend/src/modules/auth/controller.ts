import { FastifyReply, FastifyRequest } from 'fastify';

import { authService } from './service';
import { replyBadRequestFromZod } from '../../utils/zod';
import { LoginBodySchema, RegisterBodySchema } from './schema';

export function authController(deps: {
  service: ReturnType<typeof authService>;
  signAccessToken: (user: { id: string; email: string }) => string;
}) {
  return {
    register: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsedBody = RegisterBodySchema.safeParse(request.body ?? {});
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const result = await deps.service.register(parsedBody.data);

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      const token = deps.signAccessToken({
        id: result.userId,
        email: result.userEmail,
      });

      reply.code(201);
      return { token, user: result.user };
    },

    login: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsedBody = LoginBodySchema.safeParse(request.body ?? {});
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const result = await deps.service.login(parsedBody.data);

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      const token = deps.signAccessToken({
        id: result.userId,
        email: result.userEmail,
      });
      return { token, user: result.user };
    },
  };
}
