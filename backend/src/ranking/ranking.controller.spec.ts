import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { setAppConfig } from 'src/main';
import { PrismaService, PrismaTestService } from 'src/prisma/prisma.service';
import { createPoints, createUser } from 'src/_test/helper/createFixture';
import { resetAllData } from 'src/_test/helper/resetAllDbData';
import * as request from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';

describe('TodoController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }) // テスト用DBに切り替え
      .overrideProvider(PrismaService)
      .useClass(PrismaTestService)
      .compile();

    const _app = moduleRef.createNestApplication<NestExpressApplication>();
    app = setAppConfig(_app);
    await app.init();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get(AuthService);
    await resetAllData(prisma);
  }, 15000);

  beforeEach(async () => {
    await resetAllData(prisma);
  });

  describe(`GET /ranking/:type`, () => {
    it('正常系', async () => {
      const user = await createUser(prisma);
      await createPoints(prisma, user.id, 50);
      await createPoints(prisma, (await createUser(prisma, '1@gmail.com')).id, 50);
      await createPoints(prisma, (await createUser(prisma, '2@gmail.com')).id, 50);
      await createPoints(prisma, (await createUser(prisma, '3@gmail.com')).id, 50);
      await createPoints(prisma, (await createUser(prisma, '4@gmail.com')).id, 50);
      await createPoints(prisma, (await createUser(prisma, '5@gmail.com')).id, 50);
      await createPoints(prisma, (await createUser(prisma, '6@gmail.com')).id, 50);
      await createPoints(prisma, (await createUser(prisma, '7@gmail.com')).id, 50);
      const accessToken = (await authService.login(user)).accessToken;

      await request(app.getHttpServer())
        .get('/ranking/STEPS')
        .send()
        .auth(accessToken, { type: 'bearer' })
        .expect(200)
        .expect((response) => {
          expect(response.body.myRank).toBeGreaterThanOrEqual(0);
          expect(response.body.myRank).toBeLessThanOrEqual(7);
          expect(response.body.sumGroupByUser).toHaveLength(8);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
