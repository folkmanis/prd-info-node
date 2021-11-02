import { Injectable } from '@nestjs/common';
import { Notification, NotificationModules, SystemNotification } from './entities';
import { from, Observable, Subject, interval } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';
import { ObjectId } from 'mongodb';

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
