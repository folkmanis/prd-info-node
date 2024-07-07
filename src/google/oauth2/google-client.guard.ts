import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Credentials } from 'google-auth-library';
import { Observable } from 'rxjs';
import { Oauth2Service } from './oauth2.service.js';

@Injectable()
export class GoogleClientGuard implements CanActivate {
  constructor(private oauth2Service: Oauth2Service) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const tokens = req.session.tokens;
    assertCredentials(tokens);

    try {
      req.oAuth2 = this.oauth2Service.createAuthClient(tokens);
    } catch (error) {
      throw new ForbiddenException(error);
    }

    return true;
  }
}

function assertCredentials(
  tokens?: Credentials,
): asserts tokens is Credentials {
  if (!tokens) {
    throw new ForbiddenException('Google credentials not provided');
  }
}
