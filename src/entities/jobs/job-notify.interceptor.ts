import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { mergeMap, mapTo } from 'rxjs/operators';
import { NotificationsService, JobsNotification } from '../../notifications';
import { Request } from 'express';

@Injectable()
export class JobNotifyInterceptor implements NestInterceptor {

  constructor(
    private readonly notifications: NotificationsService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const { method, instanceId } = context.switchToHttp().getRequest() as Request;

    if (method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap(job => {
        const operation = methodOperation(method);
        const jobId = job.jobId;
        if (operation && jobId) {
          const notification = new JobsNotification({ jobId, operation });
          notification.instanceId = instanceId;
          return this.notifications.notify$(notification)
            .pipe(mapTo(job));
        }
        return of(job);
      })
    );
  }

}

function methodOperation(method: string): 'create' | 'delete' | 'update' | undefined {
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