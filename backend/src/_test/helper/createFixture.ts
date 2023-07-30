import { HealthType, Point, Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { User } from 'src/user/user.entity';

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

export const createPoints = async (prismaClient: PrismaClient, userId: User['id'], count = 10) => {
  const TYPES = [HealthType.ACTIVE_ENERGY_BURNED, HealthType.STEPS, HealthType.SLEEP_IN_BED];

  const points: Prisma.PointCreateManyInput[] = Array.from({ length: count }).map((_, i) => {
    const dateFrom = new Date(2000 + Math.random() * 22, 1 + Math.random() * 11, 1 + Math.random() * 28);
    return {
      userId,
      type: TYPES[i % 3],
      dateFrom,
      dateTo: addDays(dateFrom, 1 + Math.random() * 1000),
      value: Math.random() * 100,
    };
  });
  return prismaClient.point.createMany({
    data: points,
  });
};
