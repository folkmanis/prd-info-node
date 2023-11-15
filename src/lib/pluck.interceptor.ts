import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'lodash';

@Injectable()
export class PluckInterceptor implements NestInterceptor {
  private path: string[];

  constructor(...path: string[]) {
    this.path = path;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => get(data, this.path)));
  }
}
