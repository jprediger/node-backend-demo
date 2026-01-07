import { User } from '@prisma/client';
import { usersRepository } from './repository';

export type PublicUser = Omit<User, 'password'>;

const toPublicUser = (user: User): PublicUser => {
  const { password, ...safe } = user;
  void password;
  return safe;
};

export function usersService(deps: {
  repo: ReturnType<typeof usersRepository>;
}) {
  return {
    async getMe(userId: string) {
      const user = await deps.repo.findUserById(userId);
      if (!user) {
        return {
          ok: false as const,
          statusCode: 404,
          message: 'User not found',
        };
      }

      return { ok: true as const, user: toPublicUser(user) };
    },
  };
}
