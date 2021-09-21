import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { mergeMap, Observable, of, throwError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class NullResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap(nullErrorFn(context)),
    );
  }
}

function nullErrorFn(context: ExecutionContext): <T>(data: T) => Observable<T | never> {
  return (data) => {

    if (data === null || data === undefined) {
      const req: Request = context.switchToHttp().getRequest();
      return throwError(() => new NotFoundException(req.url));
    }
    return of(data);
  };
}
