import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Oauth2Service } from './oauth2.service';
import { Request } from 'express';


@Injectable()
export class GoogleClientGuard implements CanActivate {

  constructor(
    private oauth2Service: Oauth2Service,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const req: Request = context.switchToHttp().getRequest();

    const tokens = req.session.oauth2?.tokens;

    try {
      req.oAuth2 = this.oauth2Service.createAuthClient(tokens);
    } catch (error) {
      throw new UnauthorizedException(error);
    }


    return true;
  }
}
