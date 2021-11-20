import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Notification, NotificationModules } from './entities';

@Injectable()
export class NotificationsService {

  private readonly notifications$ = new Subject<Notification>();

  constructor() { }

  subscribeTo(modules: NotificationModules[], inst: string): Observable<Notification> {
    return this.notifications$.pipe(
      filter(notification => modules.includes(notification.module)),
      filter(({ instanceId }) => instanceId === undefined || instanceId !== inst),
    );
  }

  notify(notification: Notification) {
    this.notifications$.next(notification);
  }

}
