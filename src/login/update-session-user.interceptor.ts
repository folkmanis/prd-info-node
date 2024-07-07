import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Request } from 'express';
import { UsersService } from '../entities/users/index.js';

@Injectable()
export class UpdateSessionUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();

    const user = req.session.user;

    if (!user) {
      return next.handle();
    }

    return from(this.usersService.getSessionUser(user.username)).pipe(
      tap((usr) => (req.session.user = usr)),
      mergeMap(() => next.handle()),
    );
  }
}
