import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  MONGO_CLIENT,
  provideMongoConnection,
} from '../database/mongo-connection.provider.js';
import { validate } from '../dot-env.config.js';
import { provideCustomersCollection } from '../entities/customers/customers-dao/customers-provider.js';
import { provideEquipmentCollection } from '../entities/equipment/dao/equipment-provider.js';
import { provideJobsCollection } from '../entities/jobs/dao/jobs-collection.provider.js';
import { provideMaterialsCollection } from '../entities/materials/dao/materials-collection.provider.js';
import { provideProductionStagesCollection } from '../entities/production-stages/dao/production-stages.provider.js';
import { provideLogCollection } from '../logging/logger-dao/log-collection.provider.js';
import { CustomersMaintenanceService } from './customers-maintenace.service.js';
import { EquipmentMaintenanceService } from './equipment-maintenance.service.js';
import { JobsMaintenanceService } from './jobs-maintenance.service.js';
import { LogMaintenanceService } from './log-maintenance.service.js';
import { MaintenanceService } from './maintenance.service.js';
import { MaterialsMaintenanceService } from './materials-maintenance.service.js';
import { ProductionStagesMaintenanceService } from './production-stages-maintenance.service.js';
import { TransportationMaintenanceModule } from './transportation/transportation-maintenance.module.js';

@Module({
  providers: [
    provideMongoConnection,
    provideJobsCollection,
    provideCustomersCollection,
    provideLogCollection,
    provideMaterialsCollection,
    provideEquipmentCollection,
    provideProductionStagesCollection,
    MaintenanceService,
    JobsMaintenanceService,
    CustomersMaintenanceService,
    LogMaintenanceService,
    MaterialsMaintenanceService,
    EquipmentMaintenanceService,
    ProductionStagesMaintenanceService,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    TransportationMaintenanceModule,
  ],
  exports: [MaintenanceService, MONGO_CLIENT],
})
export class MaintenanceModule {}
