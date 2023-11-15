import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mergeMap, Observable, of, throwError } from 'rxjs';
import { Request } from 'express';

export const AllowNullResponse = () => SetMetadata('allow-null-response', true);

@Injectable()
export class NullResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const allowNull = this.reflector.get<boolean>(
      'allow-null-response',
      context.getHandler(),
    );

    if (allowNull) {
      return next.handle();
    }

    return next.handle().pipe(mergeMap(nullErrorFn(context)));
  }
}

function nullErrorFn(
  context: ExecutionContext,
): <T>(data: T) => Observable<T | never> {
  return (data) => {
    if (data === null || data === undefined) {
      const req: Request = context.switchToHttp().getRequest();
      return throwError(() => new NotFoundException(req.url));
    }
    return of(data);
  };
}
