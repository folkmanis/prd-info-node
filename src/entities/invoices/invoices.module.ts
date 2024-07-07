import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';
import { InvoicesController } from './invoices.controller.js';
import { InvoicesDao } from './dao/invoices-dao.service.js';
import { InvoicesCounterService } from './dao/counter.service.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { CustomersModule } from '../customers/customers.module.js';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesDao, InvoicesCounterService],
  imports: [JobsModule, CustomersModule],
})
export class InvoicesModule { }
