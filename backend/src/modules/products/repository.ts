import { PrismaClient, Product, User } from '@prisma/client';

export function productsRepository(prisma: PrismaClient) {
  return {
    list() {
      return prisma.product.findMany({ include: { author: true } });
    },

    findById(id: string) {
      return prisma.product.findUnique({
        where: { id },
        include: { author: true },
      });
    },

    findRawById(id: string): Promise<Product | null> {
      return prisma.product.findUnique({ where: { id } });
    },

    findUserById(id: string): Promise<User | null> {
      return prisma.user.findUnique({ where: { id } });
    },

    create(data: {
      name: string;
      category: string;
      authorId: string;
      description?: string;
      imagePath?: string;
      thumbnailPath?: string;
    }) {
      return prisma.product.create({ data, include: { author: true } });
    },

    update(
      id: string,
      data: Partial<{
        name: string;
        category: string;
        authorId: string;
        description?: string;
        imagePath?: string;
        thumbnailPath?: string;
      }>
    ) {
      return prisma.product.update({
        where: { id },
        data,
        include: { author: true },
      });
    },

    delete(id: string) {
      return prisma.product.delete({ where: { id } });
    },
  };
}
