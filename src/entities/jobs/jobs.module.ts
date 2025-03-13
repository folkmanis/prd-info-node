import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';
import { jobsCollectionProvider } from './dao/jobs-collection.provider.js';
import { JobsDao } from './dao/jobs-dao.service.js';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service.js';
import { KastesJobsDao } from './dao/kastes-jobs-dao.js';
import { FilesystemModule } from '../../filesystem/filesystem.module.js';
import { CustomersModule } from '../customers/customers.module.js';
import { JobsCounterService } from './dao/counters.service.js';
import { ProductsModule } from '../products/products.module.js';
import { NotificationsModule } from '../../notifications/index.js';
import { ProductsController } from './products.controller.js';
import { JobsProductsDaoService } from './dao/jobs-products-dao.service.js';
import { JobsPreferencesController } from './jobs-preferences.controller.js';
import { UsersModule } from '../users/index.js';
import { JobFilesController } from './job-files/job-files.controller.js';
import { JobFilesService } from './job-files/job-files.service.js';
import { JOBS_COLLECTION } from './dao/jobs-collection.provider.js';
import { JobsMaterialsDaoService } from './dao/jobs-materials-dao.service.js';

@Module({
  imports: [
    FilesystemModule,
    CustomersModule,
    ProductsModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [
    JobFilesController,
    JobsPreferencesController,
    ProductsController,
    JobsController,
  ],
  providers: [
    JobsService,
    JobFilesService,
    jobsCollectionProvider,
    JobsDao,
    JobsInvoicesDao,
    KastesJobsDao,
    JobsCounterService,
    JobsProductsDaoService,
    JobsMaterialsDaoService,
  ],
  exports: [JOBS_COLLECTION, JobsService, JobsDao],
})
export class JobsModule {}
