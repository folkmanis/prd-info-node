import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { XmfSearchController } from './xmf-search.controller';
import { XmfUploadController } from './xmf-upload.controller';
import { XmfSearchDao } from './dao/xmf-search.dao';
import { PreferencesModule } from '../../preferences';
import { UploadProgressService } from './parser/upload-progress.service';
import { XmfParserService } from './parser/xmf-parser-service';
import { MessagesModule } from '../../messages';
import { XmfUploadProgressDao } from './dao/xmf-upload-progress.dao';
import { AddUserCustomersMiddleware } from './add-user-customers.middleware';

@Module({
  imports: [
    PreferencesModule,
    MessagesModule,
  ],
  controllers: [
    XmfSearchController,
    XmfUploadController,
  ],
  providers: [
    XmfSearchDao,
    UploadProgressService,
    XmfParserService,
    XmfUploadProgressDao,
  ]
})
export class XmfSearchModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddUserCustomersMiddleware)
      .exclude('customers')
      .forRoutes(XmfSearchController);
  }
}
