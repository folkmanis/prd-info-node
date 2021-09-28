import { Module } from '@nestjs/common';
import { KastesService } from './kastes.service';
import { KastesController } from './kastes.controller';
import { VeikaliDaoService } from './dao/veikali-dao.service';
import { veikaliProvider } from './dao/veikali.injector';
import { XlsParserService } from './xls-parser/xls-parser.service';
import { XlsParserController } from './xls-parser/xls-parser.controller';

@Module({
  controllers: [
    KastesController,
    XlsParserController,
  ],
  providers: [
    veikaliProvider,
    VeikaliDaoService,
    KastesService,
    XlsParserService,
  ]
})
export class KastesModule { }
