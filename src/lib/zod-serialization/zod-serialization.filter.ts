import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError, z } from 'zod';

@Catch(ZodSerializationException)
export class ZodSerializationFilter<T extends ZodSerializationException>
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger('ZodSerializationException');

  catch(exception: T, host: ArgumentsHost) {
    const zodError = exception.getZodError();
    if (zodError instanceof ZodError) {
      this.logger.error(
        `ZodSerializationException: ${z.prettifyError(zodError)}`,
        exception.stack,
        z.treeifyError(zodError),
      );
    }
    super.catch(exception, host);
  }
}
