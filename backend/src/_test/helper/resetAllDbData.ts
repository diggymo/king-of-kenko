import { PrismaClient } from '@prisma/client';

export const resetAllData = async (prismaClient: PrismaClient) => {
  await prismaClient.todo.deleteMany({});
  await prismaClient.point.deleteMany({});
  await prismaClient.user.deleteMany({});
};
