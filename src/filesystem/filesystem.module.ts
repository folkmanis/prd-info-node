import { Module } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';
import { NotificationsModule } from '../notifications';
import { MessagesModule } from '../messages';

@Module({
  imports: [NotificationsModule, MessagesModule],
  providers: [FilesystemService],
  exports: [FilesystemService],
})
export class FilesystemModule {}
