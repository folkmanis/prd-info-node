import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { NotificationsModule } from '../notifications';

@Module({
  imports: [NotificationsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [
    MessagesService,
  ]
})
export class MessagesModule { }
