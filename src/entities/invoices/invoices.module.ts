import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesDao } from './dao/invoices-dao.service';
import { CounterService } from './dao/counter.service';
import { JobsModule } from '../jobs/jobs.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoicesDao,
    CounterService,
  ],
  imports: [
    JobsModule,
    CustomersModule,
  ]
})
export class InvoicesModule { }
