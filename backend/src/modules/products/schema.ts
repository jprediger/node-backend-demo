import { z } from 'zod';

export const ProductIdParamsSchema = z.object({
  id: z.string().uuid('id deve ser um UUID válido'),
});

export const CreateProductBodySchema = z.object({
  name: z.string().trim().min(1, 'name é obrigatório'),
  category: z.string().trim().min(1, 'category é obrigatório'),
  authorId: z.string().uuid('authorId deve ser um UUID válido'),
  description: z
    .string()
    .trim()
    .min(1, 'description não pode ser vazio')
    .optional(),
  imagePath: z
    .string()
    .trim()
    .min(1, 'imagePath não pode ser vazio')
    .optional(),
  thumbnailPath: z
    .string()
    .trim()
    .min(1, 'thumbnailPath não pode ser vazio')
    .optional(),
});

export const UpdateProductBodySchema = CreateProductBodySchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'Envie ao menos um campo para atualizar' }
);

export type ProductIdParams = z.infer<typeof ProductIdParamsSchema>;
export type CreateProductBody = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBody = z.infer<typeof UpdateProductBodySchema>;

export const ProductUploadUrlBodySchema = z.object({
  contentType: z.string().trim().min(1, 'contentType é obrigatório'),
});

export type ProductUploadUrlBody = z.infer<typeof ProductUploadUrlBodySchema>;
