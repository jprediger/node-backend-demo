import { z } from 'zod';

export const MeUserIdSchema = z.string().uuid('user.id inválido');

export type MeUserId = z.infer<typeof MeUserIdSchema>;
