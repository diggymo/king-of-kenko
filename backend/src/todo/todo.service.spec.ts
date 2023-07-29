import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService, PrismaTestService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.entity';
import { createUser } from 'src/_test/helper/createFixture';
import { resetAllData } from 'src/_test/helper/resetAllDbData';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let prisma: PrismaService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      providers: [TodoService],
    })
      // テスト用DBに切り替え
      .overrideProvider(PrismaService)
      .useClass(PrismaTestService)
      .compile();

    service = await moduleRef.resolve(TodoService);
    prisma = await moduleRef.resolve(PrismaService);
  });
  beforeEach(async () => {
    await resetAllData(prisma);

    user = await createUser(prisma);
  });

  it('DIで解決できるか', () => {
    expect(service).toBeDefined();
  });

  it('データが作成できるか', async () => {
    await expect(prisma.todo.count()).resolves.toEqual(0);

    await service.create(user.id, {
      title: 'test_title',
      description: 'test_description',
    });

    const allTodos = await prisma.todo.findMany({});
    expect(allTodos).toMatchObject([
      {
        title: 'test_title',
        description: 'test_description',
        createdById: user.id,
      },
    ]);
  });

  it('データが編集できるか', async () => {
    const todo = await prisma.todo.create({
      data: { createdById: user.id, title: 'test_title', description: 'test_description' },
    });

    await service.update(user.id, todo.id, {
      title: 'updated_title',
      description: 'updated_description',
    });

    const allTodos = await prisma.todo.findMany({});
    expect(allTodos).toMatchObject([
      {
        title: 'updated_title',
        description: 'updated_description',
        createdById: user.id,
      },
    ]);
  });

  it('存在しないデータを編集しようとするとエラーが出ること', async () => {
    await expect(
      service.update(user.id, 'invalild_id', { title: 'updated_title', description: 'updated_description' }),
    ).rejects.toThrowError();
  });

  it('データが取得できるか', async () => {
    const todo = await prisma.todo.create({
      data: { createdById: user.id, title: 'test_title', description: 'test_description' },
    });

    const foundTodo = await service.findOne(user.id, todo.id);

    expect(todo).toEqual(foundTodo);
  });

  it('存在しないデータを取得するとエラーが出るか', async () => {
    await expect(service.findOne(user.id, 'invalild_id')).rejects.toThrowError();
  });

  it('自分のtodoが新しい順で取得できるか', async () => {
    const anotherUser = await createUser(prisma, 'marooon88+hoge@gmail.com');

    const originalTodos = [
      {
        createdById: user.id,
        title: 'test_title1',
        description: 'test_description1',
        createdAt: new Date('2023-03-01'),
      },
      {
        createdById: user.id,
        title: 'test_title2',
        description: 'test_description2',
        createdAt: new Date('2000-01-01'),
      },
      {
        createdById: anotherUser.id,
        title: 'test_title3',
        description: 'test_description3',
        createdAt: new Date('2023-03-01'),
      },
      {
        createdById: user.id,
        title: 'test_title4',
        description: 'test_description4',
        createdAt: new Date('2020-01-01'),
      },
    ];
    await prisma.todo.createMany({
      data: originalTodos,
    });

    const allTodos = await service.findAll(user.id);
    // 自身のもののみ
    expect(allTodos).toHaveLength(3);
    // 並び順が正しいか
    expect(allTodos).toMatchObject(
      originalTodos
        .filter((t) => t.createdById === user.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  });

  it('todoが削除できるか', async () => {
    const todo = await prisma.todo.create({
      data: { createdById: user.id, title: 'test_title', description: 'test_description' },
    });

    await service.remove(user.id, todo.id);
    expect(await prisma.todo.count()).toEqual(0);
  });

  it('存在しないデータを削除するとエラーが出るか', async () => {
    await expect(
      service.remove(user.id, 'invalid_id'),
      // TODO: error handling
    ).rejects.toThrowError();
  });
});
