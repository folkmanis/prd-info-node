import { Module } from '@nestjs/common';
import { UsersModule } from './users';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { JobsModule } from './jobs/jobs.module';
import { ProductsModule } from './products/products.module';
import { XmfSearchModule } from './xmf-search/xmf-search.module';
import { KastesModule } from './kastes/kastes.module';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
    imports: [
        UsersModule,
        CustomersModule,
        InvoicesModule,
        JobsModule,
        ProductsModule,
        XmfSearchModule,
        KastesModule,
        EquipmentModule,
    ]
})
export class EntitiesModule { }
