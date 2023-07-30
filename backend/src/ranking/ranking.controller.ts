import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { AuthorizedUser, UserType } from 'src/user/user.decorator';
import { z } from 'zod';
import { HealthType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

const schemaRequestRanking = z.object({
  type: z.nativeEnum(HealthType),
});

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('/:type')
  @UseGuards(JwtAuthGuard)
  async getRanking(@Req() request: Request, @AuthorizedUser() user: UserType) {
    const requestDto = schemaRequestRanking.parse(request.params);

    return this.rankingService.getRanking(requestDto.type, user.userId);
  }
}
