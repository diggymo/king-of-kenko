import { BadRequestException } from '@nestjs/common';

export class DomainException extends BadRequestException {
  constructor(code: string, message: string, meta = {}) {
    super({
      type: 'DOMAIN_EXCEPTION',
      code,
      message,
      meta,
    });
  }
}
