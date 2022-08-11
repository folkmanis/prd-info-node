import { Module } from '@nestjs/common';
import { FtpWatcherService } from './ftp-watcher.service';
import { MessagesModule } from '../messages';

@Module({
  imports: [MessagesModule],
  providers: [FtpWatcherService],
  exports: [FtpWatcherService],
})
export class FtpWatcherModule { }
