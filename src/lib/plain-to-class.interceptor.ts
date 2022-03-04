import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { plainToClass, ClassConstructor, ClassTransformOptions, classToPlain } from 'class-transformer';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class PlainToClassInterceptor<T extends Record<string, any>, R> implements NestInterceptor<T, R> {

  constructor(
    private type: ClassConstructor<R>,
    private options?: ClassTransformOptions,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => plainToClass(this.type, data, this.options)),
    );
  }
}
