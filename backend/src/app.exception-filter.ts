import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodError } from 'zod';
import { ValidationException } from './exceptions/valiation.exception';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof ZodError) {
      return super.catch(new ValidationException(exception), host);
    }

    return super.catch(exception, host);
  }
}
