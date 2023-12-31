import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { AppModule } from 'src/app.module';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    controller = module.get(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
