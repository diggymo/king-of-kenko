import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { Request } from 'express';
import { z } from 'zod';
import { HealthType } from '@prisma/client';
import { AuthorizedUser, UserType } from 'src/user/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

const schemaRequestCreateDto = z.array(
  z.object({
    type: z.nativeEnum(HealthType),
    dateFrom: z
      .string()
      .datetime({ offset: true })
      .transform((date) => new Date(date)),
    dateTo: z
      .string()
      .datetime({ offset: true })
      .transform((date) => new Date(date)),
    value: z.number(),
  }),
);

@Controller('health/points')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() request: Request, @AuthorizedUser() user: UserType) {
    const requestDto = schemaRequestCreateDto.parse(request.body);

    await this.healthService.create(requestDto, user.userId);
  }
}
