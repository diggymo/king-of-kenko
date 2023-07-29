import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

/**
 * テスト時専用のmodule
 */
@Injectable()
export class PrismaTestService extends PrismaService {
  constructor(configService: ConfigService) {
    const id = process.env.JEST_WORKER_ID;

    // URLをすげ替え
    const databaseUrl = configService.get<string>('DATABASE_URL')?.replace(/\?schema=.*$/g, `?schema=${id}`);
    if (databaseUrl === undefined) throw new Error('DATABASE_URL is not defined');

    // テーブルを初期化
    execSync(`DATABASE_URL="${databaseUrl}" yarn prisma migrate reset --force`);
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: [
        // 'query',
        'info',
        'warn',
        'error',
      ],
    });
  }
}
