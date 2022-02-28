import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Injectable()
export class PluckInterceptor implements NestInterceptor {

  private path: string[];

  constructor(
    ...path: string[]
  ) {
    this.path = path;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      pluck(...this.path)
    );
  }
}
