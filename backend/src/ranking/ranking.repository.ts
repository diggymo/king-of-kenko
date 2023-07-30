import { Injectable } from '@nestjs/common';
import { HealthType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.entity';
@Injectable()
export class RankingRepository {
  constructor(private prismaService: PrismaService) {}

  async getRanking(type: HealthType, userId: User['id'], gteDate: Date) {
    const sumGroupByUser = await this.getScoreGroupByUser(type, gteDate);

    const sorted = sumGroupByUser
      .filter((sum) => sum._sum.value !== null)
      .sort((a, b) => (a._sum.value! < b._sum.value! ? 1 : -1));

    const myRank = sorted.findIndex(({ userId: groupByUserId }) => groupByUserId === userId);
    return {
      sumGroupByUser: sorted,
      /** 自分の順位、0始まり。データが一切存在しない場合はnullとなる */
      myRank: myRank === -1 ? null : myRank,
    };
  }

  getScoreGroupByUser(type: HealthType, gteDate: Date) {
    return this.prismaService.point.groupBy({
      _sum: {
        value: true,
      },
      by: ['userId'],
      where: {
        dateFrom: {
          gte: gteDate,
        },
        type,
      },
    });
  }
}
