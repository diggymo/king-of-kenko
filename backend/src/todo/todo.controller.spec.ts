import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { setAppConfig } from 'src/main';
import { PrismaService, PrismaTestService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.entity';
import { createTodo, createUser } from 'src/_test/helper/createFixture';
import { resetAllData } from 'src/_test/helper/resetAllDbData';
import * as request from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';

describe('TodoController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let authService: AuthService;
  let user: User;

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
    authService = moduleRef.get<AuthService>(AuthService);

    await resetAllData(prisma);
  }, 15000);

  beforeEach(async () => {
    await resetAllData(prisma);
    user = await createUser(prisma);
    accessToken = (await authService.login(user)).accessToken;
  });

  describe(`POST /todos`, () => {
    it('正常系', async () => {
      await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'タイトル',
          description: '説明',
        })
        .auth(accessToken, { type: 'bearer' })
        .expect(201);

      await expect(prisma.todo.findFirst()).resolves.toMatchObject({ title: 'タイトル', description: '説明' });
    });

    it.each([
      { title: '', description: '説明' },
      { title: null, description: '説明' },
      { description: '説明' },
      { title: 'タイトル', description: '' },
      { title: 'タイトル', description: null },
      { title: 'タイトル' },
    ])('異常系 %s', async (requestBody) => {
      await request(app.getHttpServer())
        .post('/todos')
        .send(requestBody)
        .auth(accessToken, { type: 'bearer' })
        .expect(400);

      await expect(prisma.todo.count()).resolves.toBe(0);
    });
  });

  describe(`PATCH /todos/{id}`, () => {
    let todoId: string;
    beforeEach(async () => {
      const todo = await createTodo(prisma, user.id);
      todoId = todo.id;
    });
    it('正常系', async () => {
      await request(app.getHttpServer())
        .patch(`/todos/${todoId}`)
        .send({
          title: 'changed',
          description: 'changed',
        })
        .auth(accessToken, { type: 'bearer' })
        .expect(204);

      await expect(prisma.todo.findFirst()).resolves.toMatchObject({ title: 'changed', description: 'changed' });
    });

    it.each([{ title: '' }, { title: null }, { description: '' }, { description: null }])(
      '異常系 %s',
      async (requestBody) => {
        await request(app.getHttpServer())
          .post('/todos')
          .send(requestBody)
          .auth(accessToken, { type: 'bearer' })
          .expect(400);

        await expect(prisma.todo.count()).resolves.toBe(1);
      },
    );
  });

  describe(`GET /todos`, () => {
    it.each([
      [{}, 15, '29'],
      [{ limit: null }, 0, undefined], // limit=0件で解釈される
      [{ limit: '' }, 0, undefined], // limit=0件で解釈される
      [{ offset: null }, 15, '29'],
      [{ offset: '' }, 15, '29'],
      [{ limit: '1' }, 1, '29'],
      [{ offset: '1' }, 15, '28'],
      [{ offset: '1', limit: '1' }, 1, '28'],
      [{ offset: '20', limit: '20' }, 10, '9'],
    ])('正常系 %s', async (queryParams, responseCount, firstTodoTitle) => {
      // Todoを30件作成、最も新しいTodoのタイトルは29
      for (let i = 0; i < 30; i++) {
        await createTodo(prisma, user.id, '' + i);
      }

      const response = await request(app.getHttpServer())
        .get(`/todos`)
        .query(queryParams)
        .auth(accessToken, { type: 'bearer' })
        .expect(200);

      expect(response.body?.length).toBe(responseCount);
      expect(response.body[0]?.title).toBe(firstTodoTitle);
    });

    it.each([[{ limit: 'abcde' }], [{ offset: 'abcde' }], [{ limit: '123.45' }], [{ offset: '123.45' }]])(
      '異常系 %s',
      async (queryParams) => {
        await request(app.getHttpServer())
          .get(`/todos`)
          .query(queryParams)
          .auth(accessToken, { type: 'bearer' })
          .expect(400);
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
