import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import {
  Observable,
  mergeMap,
  from,
  map,
  MonoTypeOperatorFunction,
} from 'rxjs';
import { JobFilesService } from './job-files/job-files.service.js';

@Injectable()
export class UpdateJobFilesLocationInterceptor implements NestInterceptor {
  constructor(private jobFilesService: JobFilesService) { }

  intercept<R>(context: ExecutionContext, next: CallHandler<R>): Observable<R> {
    const req = context.switchToHttp().getRequest() as Request;
    const jobId = parseInt(req.params.jobId, 10);

    if (isNaN(jobId)) {
      return next.handle();
    }

    return next.handle().pipe(this.updateLocation(jobId));
  }

  private updateLocation<U>(jobId: number): MonoTypeOperatorFunction<U> {
    return mergeMap((value) =>
      from(this.jobFilesService.updateJobFolderPath(jobId)).pipe(
        map((_) => value),
      ),
    );
  }
}
