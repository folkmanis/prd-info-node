import { Module } from '@nestjs/common';
import { FtpWatcherService } from './ftp-watcher.service.js';
import { MessagesModule } from '../messages/index.js';

@Module({
  imports: [MessagesModule],
  providers: [FtpWatcherService],
  exports: [FtpWatcherService],
})
export class FtpWatcherModule { }
