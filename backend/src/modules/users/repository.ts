import { PrismaClient, User } from '@prisma/client';

export function usersRepository(prisma: PrismaClient) {
  return {
    findUserById(id: string): Promise<User | null> {
      return prisma.user.findUnique({
        where: { id },
      });
    },
  };
}
