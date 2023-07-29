import { PrismaClient } from '@prisma/client';

export const resetAllData = async (prismaClient: PrismaClient) => {
  await prismaClient.todo.deleteMany({});
  await prismaClient.user.deleteMany({});
};
