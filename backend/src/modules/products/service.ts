import { productsRepository } from './repository';
import { CreateProductBody, UpdateProductBody } from './schema';
import { randomUUID } from 'node:crypto';

export function productsService(deps: {
  repo: ReturnType<typeof productsRepository>;
}) {
  return {
    list() {
      return deps.repo.list();
    },

    async getById(id: string) {
      const product = await deps.repo.findById(id);
      if (!product) {
        return {
          ok: false as const,
          statusCode: 404,
          message: 'Product not found',
        };
      }
      return { ok: true as const, product };
    },

    async create(body: CreateProductBody) {
      const { authorId } = body;

      const owner = await deps.repo.findUserById(authorId);
      if (!owner) {
        return {
          ok: false as const,
          statusCode: 400,
          message: 'User not found for the provided authorId',
        };
      }

      const product = await deps.repo.create({
        name: body.name,
        category: body.category,
        description: body.description,
        imagePath: body.imagePath,
        thumbnailPath: body.thumbnailPath,
        authorId,
      });

      return { ok: true as const, product };
    },

    async update(id: string, body: UpdateProductBody) {
      const existing = await deps.repo.findRawById(id);
      if (!existing) {
        return {
          ok: false as const,
          statusCode: 404,
          message: 'Product not found',
        };
      }

      if (body.authorId) {
        const owner = await deps.repo.findUserById(body.authorId);
        if (!owner) {
          return {
            ok: false as const,
            statusCode: 400,
            message: 'User not found for the provided authorId',
          };
        }
      }

      const product = await deps.repo.update(id, {
        name: body.name,
        description: body.description,
        category: body.category,
        imagePath: body.imagePath,
        thumbnailPath: body.thumbnailPath,
        authorId: body.authorId,
      });

      return { ok: true as const, product };
    },

    async delete(id: string) {
      const existing = await deps.repo.findRawById(id);
      if (!existing) {
        return {
          ok: false as const,
          statusCode: 404,
          message: 'Product not found',
        };
      }

      await deps.repo.delete(id);
      return { ok: true as const, statusCode: 204 };
    },

    async createImageObjectPath(productId: string, contentType: string) {
      console.log('createImageObjectPath', productId, contentType);
      const existing = await deps.repo.findRawById(productId);
      if (!existing) {
        throw new Error('Product not found');
      }

      const ext =
        contentType === 'image/jpeg'
          ? 'jpg'
          : contentType === 'image/png'
            ? 'png'
            : contentType === 'image/webp'
              ? 'webp'
              : 'bin';

      const objectPath = `uploads/originals/${productId}/${randomUUID()}.${ext}`;

      // Atualiza o imagePath no banco
      await deps.repo.update(productId, { imagePath: objectPath });

      return objectPath;
    },
  };
}
