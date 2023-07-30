import { Point, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HealthRepository } from './health.repository';

@Injectable()
export class HealthService {
  constructor(private prismaService: PrismaService, private repository: HealthRepository) {}

  async create(points: Pick<Point, 'type' | 'dateTo' | 'dateFrom' | 'value'>[], userId: User['id']) {
    const now = new Date();
    const dbPoints = points.map((point) => ({
      ...point,
      userId,
      createdAt: now,
    }));

    return this.repository.createManyWithoutDuplicate(userId, dbPoints);
  }

  findByPage(userId: User['id'], page: number) {
    return this.repository.findByUserId(userId, 2, page * 2, { property: 'createdAt', order: 'desc' });
  }

  findById(id: Point['id']) {
    return this.repository.findById(id);
  }
}
