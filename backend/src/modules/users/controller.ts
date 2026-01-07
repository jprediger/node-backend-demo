import { FastifyReply, FastifyRequest } from 'fastify';

import { usersService } from './service';
import { replyBadRequestFromZod } from '../../utils/zod';
import { MeUserIdSchema } from './schema';

export function usersController(deps: {
  service: ReturnType<typeof usersService>;
}) {
  return {
    me: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsedUserId = MeUserIdSchema.safeParse(request.user?.id);
      if (!parsedUserId.success) {
        return replyBadRequestFromZod(reply, parsedUserId.error);
      }

      const result = await deps.service.getMe(parsedUserId.data);

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      return result.user;
    },
  };
}
