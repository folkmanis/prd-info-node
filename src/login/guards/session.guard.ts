import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'public-route',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    if (!request.session?.user) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
