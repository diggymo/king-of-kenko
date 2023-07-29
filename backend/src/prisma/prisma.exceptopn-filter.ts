import { ArgumentsHost, Catch, ConflictException, HttpException, Logger, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

const logger = new Logger('CustomExceptionsFilter');

/**
 * Prismaのエラーを加工するExceptionFilter
 * @see https://github.com/notiz-dev/nestjs-prisma/blob/15e78c4bed01c133eae4bff0557c1faff333b0b8/lib/prisma-client-exception.filter.ts
 */
@Catch(Prisma.NotFoundError, Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  /** エラーコードとステータスコードのマッピング */
  private errorCodesStatusMapping: { [k in string]: (e: Error) => HttpException } = {
    P2002: (e) => new ConflictException('すでにデータが存在しています', { cause: e }),
    P2025: (e) => new NotFoundException('データが存在しません', { cause: e }),
  };

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof Prisma.NotFoundError) {
      return this.catchNotFound(exception, host);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.catchClientKnownRequestError(exception, host);
    }

    // NOTE: unreachable
    return super.catch(exception, host);
  }

  private catchNotFound(exception: Error, host: ArgumentsHost) {
    return super.catch(new NotFoundException('データが存在しません', { cause: exception }), host);
  }

  private catchClientKnownRequestError(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
      return super.catch(exception, host);
    }

    const message = `[${exception.code}]: ` + this.prismaExceptionShortMessage(exception.message);

    logger.warn(message);

    if (this.applicationRef !== undefined) {
      this.handleUnknownError(exception, host, this.applicationRef);
    } else {
      logger.warn(`applicationRef is undefined...`);
      logger.error(exception);
    }

    const convertedException = this.errorCodesStatusMapping[exception.code](exception);
    return super.catch(convertedException, host);
  }

  private prismaExceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));
    return shortMessage.substring(shortMessage.indexOf('\n')).replace(/\n/g, '').trim();
  }
}
