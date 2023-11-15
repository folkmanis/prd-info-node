import {
  Inject,
  forwardRef,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import {
  SystemNotification,
  Systemoperations,
  NotificationsService,
} from '../../notifications';
import { User } from './entities/user.interface';

@Injectable()
export class UserUpdateNotifyInterceptor implements NestInterceptor {
  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { instanceId, method } = context
      .switchToHttp()
      .getRequest() as Request;

    if (!instanceId || method === 'GET' || method === 'DELETE') {
      return next.handle();
    }

    return next.handle().pipe(tap((user) => this.notify(instanceId, user)));
  }

  private notify(instance: string, user: User) {
    if (!user?.username) {
      return;
    }
    const n = new SystemNotification({
      operation: Systemoperations.USER_UPDATED,
      id: user.username,
    });
    n.instanceId = instance;
    this.notificationsService.notify(n);
  }
}
