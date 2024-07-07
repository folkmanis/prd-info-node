import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { mergeMap, mapTo } from 'rxjs/operators';
import { ProductsService } from './products.service.js';
import { JobLike } from './products.service.js';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TouchProductInterceptor implements NestInterceptor {
  private touch = <T>(job: T): Observable<T> => {
    if (isJobLike(job)) {
      return this.productsService.touchProducts(job).pipe(mapTo(job));
    } else {
      return of(job);
    }
  };

  constructor(private readonly productsService: ProductsService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(mergeMap((job) => this.touch(job)));
  }
}

function isJobLike(value: any): value is JobLike {
  const { entries } = validateSync(plainToClass(JobLike, value));
  return entries.length === 0;
}
