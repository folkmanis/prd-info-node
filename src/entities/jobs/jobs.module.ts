import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { jobsCollectionProvider } from './dao/jobs-collection.provider';
import { JobsDao } from './dao/jobs-dao.service';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service';
import { KastesJobsDao } from './dao/kastes-jobs-dao';
import { FilesystemModule } from '../../filesystem/filesystem.module';
import { CustomersModule } from '../customers/customers.module';
import { JobsCounterService } from './dao/counters.service';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../../notifications';
import { ProductsController } from './products.controller';
import { JobsProductsDaoService } from './dao/jobs-products-dao.service';
import { JobsPreferencesController } from './jobs-preferences.controller';
import { UsersModule } from '../users';
import { JobFilesController } from './job-files/job-files.controller';

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
    jobsCollectionProvider,
    JobsDao,
    JobsInvoicesDao,
    KastesJobsDao,
    JobsCounterService,
    JobsProductsDaoService,
  ],
  exports: [JobsService],
})
export class JobsModule { }
