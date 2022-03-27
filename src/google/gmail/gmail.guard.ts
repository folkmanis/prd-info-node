import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { google } from 'googleapis';

@Injectable()
export class GmailGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {

    const req: Request = context.switchToHttp().getRequest();

    if (
      req.oAuth2 &&
      typeof req.session.oauth2?.tokens.scope === 'string' &&
      req.session.oauth2?.tokens.scope.indexOf('gmail') !== -1
    ) {
      req.gmail = google.gmail({
        version: 'v1',
        auth: req.oAuth2,
      });
      return true;
    }


    return false;

  }
}
