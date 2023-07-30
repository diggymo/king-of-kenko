import { Injectable } from '@nestjs/common';
import { RankingRepository } from './ranking.repository';
import { User } from 'src/user/user.entity';
import { HealthType } from '@prisma/client';
import { subDays } from 'date-fns';

@Injectable()
export class RankingService {
  constructor(private repository: RankingRepository) {}

  async getRanking(type: HealthType, userId: User['id']) {
    // FIXME: 直近4週間前にするべき
    const rankingData = await this.repository.getRanking(type, userId, subDays(new Date(), 365 * 100));

    return rankingData;
  }
}
