import { RankingRepository } from './ranking.repository';
import { HealthType } from '@prisma/client';
import { PrismaTestService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createPoints, createUser } from 'src/_test/helper/createFixture';
import { User } from 'src/user/user.entity';
import { resetAllData } from 'src/_test/helper/resetAllDbData';
import { subDays } from 'date-fns';

const prisma = new PrismaTestService(new ConfigService());
let user: User;
beforeEach(async () => {
  await resetAllData(prisma);

  user = await createUser(prisma);
});

it('グルーピングできるか', async () => {
  const repository = new RankingRepository(prisma);

  await createPoints(prisma, (await createUser(prisma, '1@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '2@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '3@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '4@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '5@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '6@gmail.com')).id, 100);

  const result = await repository.getScoreGroupByUser(HealthType.SLEEP_IN_BED, subDays(new Date(), 365 * 10));

  expect(result).toHaveLength(6);
});

it('ランキングが算出されるか', async () => {
  const repository = new RankingRepository(prisma);

  await createPoints(prisma, user.id, 100);
  await createPoints(prisma, (await createUser(prisma, '1@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '2@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '3@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '4@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '5@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '6@gmail.com')).id, 100);

  const result = await repository.getRanking(HealthType.SLEEP_IN_BED, user.id, subDays(new Date(), 365 * 10));

  expect(result.sumGroupByUser[0]._sum.value).toBeGreaterThan(result.sumGroupByUser[6]._sum.value!);
  expect(result.myRank).toBeGreaterThanOrEqual(1);
  expect(result.myRank).toBeLessThanOrEqual(7);
});

it('ランキングが算出される際、自分のデータがない場合はnullになるか', async () => {
  const repository = new RankingRepository(prisma);

  await createPoints(prisma, (await createUser(prisma, '1@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '2@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '3@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '4@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '5@gmail.com')).id, 100);
  await createPoints(prisma, (await createUser(prisma, '6@gmail.com')).id, 100);

  const result = await repository.getRanking(HealthType.SLEEP_IN_BED, user.id, subDays(new Date(), 365 * 10));

  // データが存在しないユーザーは除外されていること
  expect(result.sumGroupByUser).toHaveLength(7 - 1);
  expect(result.myRank).toEqual(null);
});
