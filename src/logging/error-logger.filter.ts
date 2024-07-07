import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';
import { pick } from 'lodash-es';

@Catch()
export class ErrorLoggerFilter<T> extends BaseExceptionFilter {
  private readonly logger = new Logger('HTTP Error');

  catch(exception: T, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const req = host.switchToHttp().getRequest() as Request;
      this.logger.error(
        exception.message,
        exception.stack,
        pick(req, ['ip', 'session', 'path', 'user']),
      );
    }
    super.catch(exception, host);
  }
}
