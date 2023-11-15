import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

export class InvalidGoogleUserException extends UnauthorizedException {}

@Catch(InvalidGoogleUserException)
export class InvalidGoogleUserFilter implements ExceptionFilter {
  logger = new Logger('google auth');

  catch(exception: InvalidGoogleUserException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    this.logger.error(exception);
    res.redirect(`/login?error=${exception.message}`);
  }
}
