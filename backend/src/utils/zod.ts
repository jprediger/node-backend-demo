import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function replyBadRequestFromZod(reply: FastifyReply, error: ZodError) {
  reply.code(400);
  return {
    message: 'Dados inválidos',
    issues: error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })),
  };
}
