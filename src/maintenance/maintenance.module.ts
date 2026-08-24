import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../dot-env.config.js';
import { provideCustomersCollection } from '../entities/customers/customers-dao/customers-provider.js';
import { provideJobsCollection } from '../entities/jobs/dao/jobs-collection.provider.js';
import { CustomersMaintenanceService } from './customers-maintenace.service.js';
import { MaintenanceService } from './maintenance.service.js';
import { provideMongoConnection } from '../database/mongo-connection.provider.js';
import { provideLogCollection } from '../logging/logger-dao/log-collection.provider.js';
import { LogMaintenanceService } from './log-maintenance.service.js';
import { JobsMaintenanceService } from './jobs-maintenance.service.js';
import { MaterialsMaintenanceService } from './materials-maintenance.service.js';
import { provideMaterialsCollection } from '../entities/materials/dao/materials-collection.provider.js';
import { provideEquipmentCollection } from '../entities/equipment/dao/equipment-provider.js';
import { EquipmentMaintenanceService } from './equipment-maintenance.service.js';

@Module({
  providers: [
    provideMongoConnection,
    provideJobsCollection,
    provideCustomersCollection,
    provideLogCollection,
    provideMaterialsCollection,
    provideEquipmentCollection,
    MaintenanceService,
    JobsMaintenanceService,
    CustomersMaintenanceService,
    LogMaintenanceService,
    MaterialsMaintenanceService,
    EquipmentMaintenanceService,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
  ],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
