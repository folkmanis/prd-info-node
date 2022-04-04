import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Credentials } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class GmailGuard implements CanActivate {

  canActivate(
    context: ExecutionContext,
  ): boolean {

    const req: Request = context.switchToHttp().getRequest();

    const tokens = req.session.user?.tokens;

    assertScope(tokens);

    try {
      req.gmail = google.gmail({
        version: 'v1',
        auth: req.oAuth2,
      });

    } catch (error) {

      throw new ForbiddenException('Not authorized for gmail');

    }

    return true;

  }
}

function assertScope(tokens: Credentials | undefined): asserts tokens is Credentials {
  if (
    !tokens ||
    typeof tokens.scope !== 'string' ||
    tokens.scope.indexOf('mail') === -1
  ) {
    throw new ForbiddenException('Not authorized for gmail');
  }
}