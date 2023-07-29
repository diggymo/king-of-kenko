import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {
  /** ヘルスチェックのためのエンドポイントです */
  @Get('healthcheck')
  healthCheck() {
    return 'ok';
  }
}
