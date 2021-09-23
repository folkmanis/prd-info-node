import { Module } from '@nestjs/common';
import { XmfSearchService } from './xmf-search.service';
import { XmfSearchController } from './xmf-search.controller';
import { XmfSearchDao } from './dao/xmf-search.dao';
import { PreferencesModule } from '../../preferences';

@Module({
  imports: [
    PreferencesModule,
  ],
  controllers: [
    XmfSearchController
  ],
  providers: [
    XmfSearchDao,
    XmfSearchService
  ]
})
export class XmfSearchModule { }
