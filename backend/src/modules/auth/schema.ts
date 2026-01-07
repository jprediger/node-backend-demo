import { z } from 'zod';

export const RegisterBodySchema = z.object({
  email: z.string().trim().email('email inválido').toLowerCase(),
  password: z.string().min(6, 'password deve ter no mínimo 6 caracteres'),
  name: z.string().trim().min(1, 'name não pode ser vazio').optional(),
});

export const LoginBodySchema = z.object({
  email: z.string().trim().email('email inválido').toLowerCase(),
  password: z.string().min(1, 'password é obrigatório'),
});

// Inferred Types for the Service
export type RegisterInput = z.infer<typeof RegisterBodySchema>;
export type LoginInput = z.infer<typeof LoginBodySchema>;
