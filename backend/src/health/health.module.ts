import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthRepository } from './health.repository';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
  imports: [PrismaModule],
})
export class HealthModule {}
