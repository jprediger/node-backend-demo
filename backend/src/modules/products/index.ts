import { FastifyPluginAsync } from 'fastify';

import { productsController } from './controller';
import { productsRepository } from './repository';
import {
  CreateProductBody,
  ProductIdParams,
  ProductUploadUrlBody,
  UpdateProductBody,
} from './schema';
import { productsService } from './service';

const productsModule: FastifyPluginAsync = async (fastify) => {
  const repo = productsRepository(fastify.prisma);
  const service = productsService({ repo });
  const controller = productsController({ service });

  fastify.get('/', { onRequest: [fastify.authenticate] }, controller.list);
  fastify.get<{ Params: ProductIdParams }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    controller.getById
  );
  fastify.post<{ Body: CreateProductBody }>(
    '/',
    { onRequest: [fastify.authenticate] },
    controller.create
  );
  fastify.put<{ Params: ProductIdParams; Body: UpdateProductBody }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    controller.update
  );
  fastify.delete<{ Params: ProductIdParams }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    controller.delete
  );

  // Signed URLs (bucket privado) - exige JWT
  fastify.post<{ Params: ProductIdParams; Body: ProductUploadUrlBody }>(
    '/:id/image/upload-url',
    { onRequest: [fastify.authenticate] },
    controller.imageUploadUrl
  );
  fastify.get<{ Params: ProductIdParams }>(
    '/:id/image-url',
    { onRequest: [fastify.authenticate] },
    controller.imageReadUrl
  );
  fastify.get<{ Params: ProductIdParams }>(
    '/:id/thumbnail-url',
    { onRequest: [fastify.authenticate] },
    controller.thumbnailReadUrl
  );
};

export default productsModule;
