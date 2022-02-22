import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import {
  NotificationsService,
  SystemNotification,
  Systemoperations,
} from '../notifications';

@Injectable()
export class MessageNotifyInterceptor implements NestInterceptor {

  constructor(
    private notificationsService: NotificationsService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const { instanceId, method } = context.switchToHttp().getRequest() as Request;

    if (!instanceId || method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => this.notify(instanceId))
    );
    
  }

  private notify(instance: string) {
    const n = new SystemNotification({
      operation: Systemoperations.MESSAGE_ALL_READ,
    });
    n.instanceId = instance;
    this.notificationsService.notify(n);
  }


}
