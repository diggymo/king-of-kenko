import { PrismaClient } from '@prisma/client';
import { createPoints, createUser } from '../src/_test/helper/createFixture';
import { resetAllData } from '../src/_test/helper/resetAllDbData';

const prisma = new PrismaClient();

/**
 * 初期データを作成するスクリプト
 */
const exec = async () => {
  await resetAllData(prisma);
  const user1 = await createUser(prisma);
  const user2 = await createUser(prisma, 'marooon88+test1@gmail.com');

  await createPoints(prisma, user1.id, 500);
  await createPoints(prisma, user2.id, 500);
};

exec()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
