import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsDaoService } from './notifications-dao/notifications-dao.service';


@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsDaoService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule { }
