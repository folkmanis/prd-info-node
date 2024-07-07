import { Module } from '@nestjs/common';
import { KastesController } from './kastes.controller.js';
import { VeikaliDaoService } from './dao/veikali-dao.service.js';
import { veikaliProvider } from './dao/veikali.injector.js';
import { XlsParserService } from './xls-parser/xls-parser.service.js';
import { XlsParserController } from './xls-parser/xls-parser.controller.js';
import { VeikaliController } from './veikali.controller.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { KastesDaoService } from './dao/kastes-dao.service.js';
import { KastesPreferencesController } from './kastes-preferences.controller.js';
import { UsersModule } from '../users/index.js';
import { KastesJobsController } from './kastes-jobs.controller.js';
import { KastesService } from './kastes.service.js';
import { FirebaseModule } from '../../firebase/firebase.module.js';

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
export class KastesModule { }
