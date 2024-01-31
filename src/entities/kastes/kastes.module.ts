import { Module } from '@nestjs/common';
import { KastesController } from './kastes.controller';
import { VeikaliDaoService } from './dao/veikali-dao.service';
import { veikaliProvider } from './dao/veikali.injector';
import { XlsParserService } from './xls-parser/xls-parser.service';
import { XlsParserController } from './xls-parser/xls-parser.controller';
import { VeikaliController } from './veikali.controller';
import { JobsModule } from '../jobs/jobs.module';
import { KastesDaoService } from './dao/kastes-dao.service';
import { KastesPreferencesController } from './kastes-preferences.controller';
import { UsersModule } from '../users';
import { KastesJobsController } from './kastes-jobs.controller';
import { KastesService } from './kastes.service';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  controllers: [
    KastesJobsController,
    KastesPreferencesController,
    VeikaliController,
    KastesController,
    XlsParserController,
  ],
  providers: [
    veikaliProvider,
    VeikaliDaoService,
    KastesDaoService,
    XlsParserService,
    KastesService,
  ],
  imports: [JobsModule, UsersModule, FirebaseModule],
})
export class KastesModule {}
