import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
const logger = new Logger('main');

async function bootstrap() {
  // NOTE: 開発サーバー起動時に結合テストが実行できるよう動的に変更可能に
  const port = parseInt(process.env.PORT || '3000', 10);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useGlobalFilters(new ValidationExceptionsFilter());
  logger.log(`running on port: ${port}`);
  await setAppConfig(app).listen(port, '0.0.0.0');
}

export const setAppConfig = (app: NestExpressApplication) => {
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  app.useBodyParser('json', { limit: '10mb' });

  const config = new DocumentBuilder()
    .setTitle('AWESOME TODO')
    .setDescription('TODOアプリケーションです')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  return app;
};
bootstrap();
