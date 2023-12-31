import { Test } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService, PrismaTestService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { resetAllData } from 'src/_test/helper/resetAllDbData';
import { createUser } from 'src/_test/helper/createFixture';
import { HealthRepository } from './health.repository';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: PrismaService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      providers: [HealthService, HealthRepository],
    })
      // テスト用DBに切り替え
      .overrideProvider(PrismaService)
      .useClass(PrismaTestService)
      .compile();

    service = await moduleRef.resolve(HealthService);
    prisma = await moduleRef.resolve(PrismaService);
  });
  beforeEach(async () => {
    await resetAllData(prisma);

    user = await createUser(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create multi points', async () => {
    const inputDataList = [
      {
        type: 'ACTIVE_ENERGY_BURNED' as const,
        dateFrom: new Date(),
        dateTo: new Date(),
        value: 0.1234567,
      },
      {
        type: 'STEPS' as const,
        dateFrom: new Date(),
        dateTo: new Date(),
        value: 0.1234567,
      },
    ];
    await service.create(inputDataList, user.id);
    expect(await prisma.point.count()).toEqual(2);
    expect(await prisma.point.findMany()).toMatchObject(inputDataList);
  });

  it('create multi points without duplicates', async () => {
    const dateFrom = new Date(2000, 1, 1);
    const dateTo = new Date(2005, 1, 1);
    const inputDataList = [
      {
        type: 'ACTIVE_ENERGY_BURNED' as const,
        dateFrom: dateFrom,
        dateTo: dateTo,
        value: 0.1234567,
      },
    ];
    await service.create(inputDataList, user.id);
    await service.create(inputDataList, user.id);
    await service.create(inputDataList, user.id);
    await service.create(inputDataList, user.id);

    // 重複なしで登録されるため1件のみ
    expect(await prisma.point.count()).toEqual(1);
  });

  it('fetch all data', async () => {
    const inputData = [
      {
        id: '1',
        dateFrom: new Date(2000, 1, 1),
        dateTo: new Date(2000, 2, 1),
        type: 'SLEEP_IN_BED' as const,
        value: 12345.56788,
        createdAt: new Date(2000, 1, 1),
        userId: user.id,
      },
      {
        id: '3',
        dateFrom: new Date(2000, 3, 1),
        dateTo: new Date(2000, 4, 1),
        type: 'SLEEP_IN_BED' as const,
        value: 12345.56788,
        createdAt: new Date(),
        userId: user.id,
      },
      {
        id: '2',
        dateFrom: new Date(2000, 5, 1),
        dateTo: new Date(2000, 6, 1),
        type: 'SLEEP_IN_BED' as const,
        value: 12345.56788,
        createdAt: new Date(2005, 2, 2),
        userId: user.id,
      },
    ];
    await prisma.point.createMany({
      data: inputData,
    });
    const result = await service.findByPage(user.id, 0);
    // 全てのデータが取得されないこと（分割されること）
    // 順序が日時の降順であること
    expect(result).toStrictEqual([inputData[1], inputData[2]]);

    expect(await service.findById(result[0].id)).toStrictEqual(inputData[1]);
  });
});
