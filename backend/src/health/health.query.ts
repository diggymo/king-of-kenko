import { Point, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';
import { SORT_SCHEMA } from 'src/helper';

const FIND_ALL_SORT_SCHEMA = SORT_SCHEMA(['createdAt', 'dateFrom'] as const);

@Injectable()
export class HealthQuery {
  constructor(private prismaService: PrismaService) {}

  findByUserId(userId: User['id'], limit: number, offset: number, sort: z.input<typeof FIND_ALL_SORT_SCHEMA>) {
    const sortObject = FIND_ALL_SORT_SCHEMA.parse(sort);
    return this.prismaService.point.findMany({
      where: {
        userId,
      },
      orderBy: sortObject,
      take: limit,
      skip: offset,
    });
  }

  findById(id: Point['id']) {
    return this.prismaService.point.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }
}
