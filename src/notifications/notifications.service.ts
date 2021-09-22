import { Injectable } from '@nestjs/common';
import { Notification } from './notification';
import { NotificationsDaoService } from './notifications-dao/notifications-dao.service';
import { from, Observable } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(private notificationsDao: NotificationsDaoService) { }

  notify(notification: Notification): Promise<boolean> {
    return this.notificationsDao.insertOne(notification);
  }

  notify$(notification: Notification): Observable<boolean> {
    return from(this.notify(notification));
  }
}
