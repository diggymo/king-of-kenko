import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

export class ValidationException extends BadRequestException {
  constructor(zodError: ZodError) {
    super({
      type: 'VALIDATION_EXCEPTION',
      code: 'VALIDATION_EXCEPTION',
      message: '不正なリクエストです',
      meta: zodError.errors,
    });
  }
}
