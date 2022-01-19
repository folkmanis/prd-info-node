import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationsService, JobsNotification } from '../../notifications';
import { Request } from 'express';
import { Job } from './entities/job.entity';

@Injectable()
export class JobNotifyInterceptor implements NestInterceptor<Job, Job> {
  constructor(private readonly notifications: NotificationsService) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Job>,
  ): Observable<Job> {
    const { method, instanceId } = context
      .switchToHttp()
      .getRequest() as Request;
    const operation = methodOperation(method);

    if (!operation) {
      return next.handle();
    }

    return next
      .handle()
      .pipe(
        tap(
          job => job?.jobId && this.notifications.notify(
            new JobsNotification({ jobId: job.jobId, operation }, instanceId),
          ),
        ),
      );
  }
}

function methodOperation(
  method: string,
): 'create' | 'delete' | 'update' | undefined {
  if (method === 'PUT') {
    return 'create';
  }
  if (method === 'DELETE') {
    return 'delete';
  }
  if (method === 'PATCH') {
    return 'update';
  }
  return undefined;
}
