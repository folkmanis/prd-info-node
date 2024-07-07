import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { XmfSearchController } from './xmf-search.controller.js';
import { XmfUploadController } from './xmf-upload.controller.js';
import { XmfSearchDao } from './dao/xmf-search.dao.js';
import { PreferencesModule } from '../../preferences/index.js';
import { UploadProgressService } from './parser/upload-progress.service.js';
import { XmfParserService } from './parser/xmf-parser-service.js';
import { MessagesModule } from '../../messages/index.js';
import { XmfUploadProgressDao } from './dao/xmf-upload-progress.dao.js';
import { AddUserCustomersMiddleware } from './add-user-customers.middleware.js';

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
export class XmfSearchModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AddUserCustomersMiddleware)
      .exclude('customers')
      .forRoutes(XmfSearchController);
  }
}
