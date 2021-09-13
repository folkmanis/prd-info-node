import { Module } from '@nestjs/common';
import { FtpWatcherService } from './ftp-watcher.service';
import { NotificationsModule } from '../notifications';
import { MessagesModule } from '../messages';

@Module({
  imports: [
    NotificationsModule,
    MessagesModule,
  ],
  providers: [FtpWatcherService],
  exports: [FtpWatcherService],
})
export class FtpWatcherModule { }
