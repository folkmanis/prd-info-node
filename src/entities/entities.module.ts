import { Module } from '@nestjs/common';
import { UsersModule } from './users/index.js';
import { CustomersModule } from './customers/customers.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { ProductsModule } from './products/products.module.js';
import { XmfSearchModule } from './xmf-search/xmf-search.module.js';
import { KastesModule } from './kastes/kastes.module.js';
import { EquipmentModule } from './equipment/equipment.module.js';
import { MaterialsModule } from './materials/materials.module.js';
import { ProductionStagesModule } from './production-stages/production-stages.module.js';

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
    MaterialsModule,
    ProductionStagesModule,
  ],
})
export class EntitiesModule { }
