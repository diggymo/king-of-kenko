import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthQuery } from './health.query';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthQuery],
  imports: [PrismaModule],
})
export class HealthModule {}
