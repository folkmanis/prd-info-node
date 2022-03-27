import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

export class InvalidGoogleUserException extends UnauthorizedException { }

@Catch(InvalidGoogleUserException)
export class InvalidGoogleUserFilter implements ExceptionFilter {

  catch(exception: InvalidGoogleUserException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    res.redirect(`/login?error=${exception.message}`);
  }

}
