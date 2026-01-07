import bcrypt from 'bcryptjs';

import { authRepository } from './repository';
import { LoginInput, RegisterInput } from './schema';

export type AuthServiceDeps = {
  repo: ReturnType<typeof authRepository>;
  passwordSaltRounds?: number;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const toPublicUser = (user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export function authService({
  repo,
  passwordSaltRounds = 10,
}: AuthServiceDeps) {
  return {
    async register(input: RegisterInput) {
      const { email, password, name } = input;

      const existing = await repo.findUserByEmail(email);
      if (existing) {
        return {
          ok: false as const,
          statusCode: 400,
          message: 'User already exists',
        };
      }

      const hashedPassword = await bcrypt.hash(password, passwordSaltRounds);
      const user = await repo.createUser({
        email,
        password: hashedPassword,
        name,
      });

      return {
        ok: true as const,
        user: toPublicUser(user),
        userId: user.id,
        userEmail: user.email,
      };
    },

    async login(input: LoginInput) {
      const { email, password } = input;

      const user = await repo.findUserByEmail(email);
      if (!user) {
        return {
          ok: false as const,
          statusCode: 401,
          message: 'Invalid credentials',
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          ok: false as const,
          statusCode: 401,
          message: 'Invalid credentials',
        };
      }

      return {
        ok: true as const,
        user: toPublicUser(user),
        userId: user.id,
        userEmail: user.email,
      };
    },
  };
}
