import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const TEST_USER_EMAIL = 'marooon88+prismatest@gmail.com';
export const TEST_USER_PASSWORD = 'hoge';

export const createTodo = async (prismaClient: PrismaClient, createdById: string, title = 'test_title') => {
  return prismaClient.todo.create({
    data: { createdById, title, description: 'test_description' },
  });
};

export const createUser = async (
  prismaClient: PrismaClient,
  userEmail = TEST_USER_EMAIL,
  userPassword = TEST_USER_PASSWORD,
) => {
  return prismaClient.user.create({
    data: {
      email: userEmail,
      // NOTE: 実装コードと同一実装にしたい
      password: await bcrypt.hash(userPassword, 10),
    },
  });
};
