import { FastifyReply, FastifyRequest } from 'fastify';

import { productsService } from './service';
import {
  CreateProductBody,
  CreateProductBodySchema,
  ProductIdParams,
  ProductIdParamsSchema,
  ProductUploadUrlBody,
  ProductUploadUrlBodySchema,
  UpdateProductBody,
  UpdateProductBodySchema,
} from './schema';

import { replyBadRequestFromZod } from '../../utils/zod';

export function productsController(deps: {
  service: ReturnType<typeof productsService>;
}) {
  return {
    list: async (request: FastifyRequest) => {
      const products = await deps.service.list();

      return Promise.all(
        products.map(async (product) => {
          const thumbnailUrl = product.thumbnailPath
            ? await request.server.gcsSignReadUrl({
                objectPath: product.thumbnailPath,
              })
            : null;

          return { ...product, thumbnailUrl };
        })
      );
    },

    getById: async (
      request: FastifyRequest<{ Params: ProductIdParams }>,
      reply: FastifyReply
    ) => {
      const parsedParams = ProductIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return replyBadRequestFromZod(reply, parsedParams.error);
      }

      const result = await deps.service.getById(parsedParams.data.id);

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      return result.product;
    },

    create: async (
      request: FastifyRequest<{ Body: CreateProductBody }>,
      reply: FastifyReply
    ) => {
      const parsedBody = CreateProductBodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const result = await deps.service.create(parsedBody.data);

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      reply.code(201);
      return result.product;
    },

    update: async (
      request: FastifyRequest<{
        Params: ProductIdParams;
        Body: UpdateProductBody;
      }>,
      reply: FastifyReply
    ) => {
      const parsedParams = ProductIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return replyBadRequestFromZod(reply, parsedParams.error);
      }

      const parsedBody = UpdateProductBodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const result = await deps.service.update(
        parsedParams.data.id,
        parsedBody.data
      );

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      return result.product;
    },

    delete: async (
      request: FastifyRequest<{ Params: ProductIdParams }>,
      reply: FastifyReply
    ) => {
      const parsedParams = ProductIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return replyBadRequestFromZod(reply, parsedParams.error);
      }

      const result = await deps.service.delete(parsedParams.data.id);

      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      reply.code(204);
    },

    imageUploadUrl: async (
      request: FastifyRequest<{
        Params: ProductIdParams;
        Body: ProductUploadUrlBody;
      }>,
      reply: FastifyReply
    ) => {
      const parsedParams = ProductIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return replyBadRequestFromZod(reply, parsedParams.error);
      }

      const parsedBody = ProductUploadUrlBodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const objectPath = await deps.service.createImageObjectPath(
        parsedParams.data.id,
        parsedBody.data.contentType
      );
      const uploadUrl = await request.server.gcsSignUploadUrl({
        objectPath,
        contentType: parsedBody.data.contentType,
      });

      return { uploadUrl, objectPath };
    },

    imageReadUrl: async (
      request: FastifyRequest<{ Params: ProductIdParams }>,
      reply: FastifyReply
    ) => {
      const parsedParams = ProductIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return replyBadRequestFromZod(reply, parsedParams.error);
      }

      const result = await deps.service.getById(parsedParams.data.id);
      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      if (!result.product.imagePath) {
        reply.code(404);
        return { message: 'Product has no imagePath' };
      }

      const url = await request.server.gcsSignReadUrl({
        objectPath: result.product.imagePath,
      });
      return { url };
    },

    thumbnailReadUrl: async (
      request: FastifyRequest<{ Params: ProductIdParams }>,
      reply: FastifyReply
    ) => {
      const parsedParams = ProductIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return replyBadRequestFromZod(reply, parsedParams.error);
      }

      const result = await deps.service.getById(parsedParams.data.id);
      if (!result.ok) {
        reply.code(result.statusCode);
        return { message: result.message };
      }

      if (!result.product.thumbnailPath) {
        reply.code(404);
        return { message: 'Product has no thumbnailPath' };
      }

      const url = await request.server.gcsSignReadUrl({
        objectPath: result.product.thumbnailPath,
      });
      return { url };
    },
  };
}
