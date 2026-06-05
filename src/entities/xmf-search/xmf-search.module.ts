import { Module } from '@nestjs/common';
import { MessagesModule } from '../../messages/index.js';
import { PreferencesModule } from '../../preferences/index.js';
import { XmfSearchDao } from './dao/xmf-search.dao.js';
import { XmfUploadProgressDao } from './dao/xmf-upload-progress.dao.js';
import { UploadProgressService } from './parser/upload-progress.service.js';
import { XmfParserService } from './parser/xmf-parser-service.js';
import { XmfSearchController } from './xmf-search.controller.js';
import { XmfUploadController } from './xmf-upload.controller.js';

@Module({
  imports: [PreferencesModule, MessagesModule],
  controllers: [XmfSearchController, XmfUploadController],
  providers: [
    XmfSearchDao,
    UploadProgressService,
    XmfParserService,
    XmfUploadProgressDao,
  ],
})
export class XmfSearchModule {}
