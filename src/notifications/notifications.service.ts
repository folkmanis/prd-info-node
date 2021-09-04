import { Injectable } from '@nestjs/common';
import { Notification } from './notification';
import { NotificationsDaoService } from './notifications-dao/notifications-dao.service';

@Injectable()
export class NotificationsService {

    constructor(
        private notificationsDao: NotificationsDaoService,
    ) { }

    async notify(notification: Notification): Promise<boolean> {
        return this.notificationsDao.insertOne(notification);
    }

}
