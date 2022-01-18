import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class ErrorLoggerFilter<T> extends BaseExceptionFilter {
  private readonly logger = new Logger('HTTP Error');

  catch(exception: T, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      this.logger.error(exception.message, exception.stack);
    }
    super.catch(exception, host);
  }
}
