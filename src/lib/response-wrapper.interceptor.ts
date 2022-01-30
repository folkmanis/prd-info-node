import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { set } from 'lodash';

export type ResponseKeys =
  | 'data'
  | 'deletedCount'
  | 'modifiedCount'
  | 'count'
  | 'response'
  | string;

export interface ResponseWrapperInterceptorOptions {
  wrapZero?: boolean;
}

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {

  constructor(
    @Optional() private key: ResponseKeys = 'data',
    @Optional() private parameters: ResponseWrapperInterceptorOptions = {},
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(wrapRespone(this.key, this.parameters))
    );
  }
}

function wrapRespone<T>(
  key: ResponseKeys,
  params: ResponseWrapperInterceptorOptions,
) {
  const { wrapZero } = params;
  return (data: T) => {
    if (!!data || wrapZero) {
      return set({}, key, data);
    }
    return undefined;
  };
}
