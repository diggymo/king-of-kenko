import { Point, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';
import { SORT_SCHEMA } from 'src/helper';
import { HealthQuery } from './health.query';

@Injectable()
export class HealthService {
  constructor(private prismaService: PrismaService, private query: HealthQuery) {}

  create(points: Pick<Point, 'type' | 'dateTo' | 'dateFrom' | 'value'>[], userId: User['id']) {
    const now = new Date();
    return this.prismaService.point.createMany({
      data: points.map((point) => ({
        ...point,
        userId,
        createdAt: now,
      })),
    });
  }

  findByPage(userId: User['id'], page: number) {
    return this.query.findByUserId(userId, 2, page * 2, { property: 'createdAt', order: 'desc' });
  }

  findById(id: Point['id']) {
    return this.query.findById(id);
  }
}
