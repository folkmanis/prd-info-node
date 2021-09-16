import { Module } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';
import { NotificationsModule } from '../notifications';
import { MessagesModule } from '../messages';
import { FolderPathService } from './folder-path.service';


@Module({
    imports: [
        NotificationsModule,
        MessagesModule,
    ],
    providers: [
        FilesystemService,
        FolderPathService,
    ],
    exports: [
        FilesystemService,
        FolderPathService,
    ]
})
export class FilesystemModule { }
