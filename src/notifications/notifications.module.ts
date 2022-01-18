import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { SessionTokenModule, SessionModule } from '../session';

@Module({
  imports: [SessionTokenModule, SessionModule],
  controllers: [],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
