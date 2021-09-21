import { Module } from '@nestjs/common';
import { UsersModule } from './users';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { JobsModule } from './jobs/jobs.module';
import { ProductsModule } from './products/products.module';

@Module({
    imports: [
        UsersModule,
        CustomersModule,
        InvoicesModule,
        JobsModule,
        ProductsModule,
    ]
})
export class EntitiesModule { }
