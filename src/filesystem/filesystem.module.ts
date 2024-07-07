import { Module } from '@nestjs/common';
import { FilesystemService } from './filesystem.service.js';
import { NotificationsModule } from '../notifications/index.js';
import { MessagesModule } from '../messages/index.js';

@Module({
  imports: [NotificationsModule, MessagesModule],
  providers: [FilesystemService],
  exports: [FilesystemService],
})
export class FilesystemModule { }
