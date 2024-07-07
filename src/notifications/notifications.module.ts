import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationsGateway } from './notifications.gateway.js';
import { SessionTokenModule, SessionModule } from '../session/index.js';

@Module({
  imports: [SessionTokenModule, SessionModule],
  controllers: [],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule { }
