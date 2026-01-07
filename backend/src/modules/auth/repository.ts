import { PrismaClient, User } from '@prisma/client';

export type CreateUserData = {
  email: string;
  password: string;
  name?: string;
};

export function authRepository(prisma: PrismaClient) {
  return {
    findUserByEmail(email: string): Promise<User | null> {
      return prisma.user.findUnique({ where: { email } });
    },

    createUser(data: CreateUserData): Promise<User> {
      return prisma.user.create({ data });
    },
  };
}
