import { Inject, Injectable, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../database/mongo-connection.provider.js';
import { CustomersMaintenanceService } from './customers-maintenace.service.js';
import { JobsMaintenanceService } from './jobs-maintenance.service.js';
import { LogMaintenanceService } from './log-maintenance.service.js';
import { MaterialsMaintenanceService } from './materials-maintenance.service.js';
import { EquipmentMaintenanceService } from './equipment-maintenance.service.js';
import { ProductionStagesMaintenanceService } from './production-stages-maintenance.service.js';
import { TransportationMaintenanceService } from './transportation/transportation-maintenance.service.js';

@Injectable()
export class MaintenanceService {
  private logger = new Logger('Maintenance');

  constructor(
    @Inject(MONGO_CLIENT) private client: MongoClient,
    private customersMaintenance: CustomersMaintenanceService,
    private logMaintenance: LogMaintenanceService,
    private jobsMaintenance: JobsMaintenanceService,
    private materialsMaintenance: MaterialsMaintenanceService,
    private equipmentMaintenance: EquipmentMaintenanceService,
    private productionStagesMaintenance: ProductionStagesMaintenanceService,
    private transportationMaintenance: TransportationMaintenanceService,
  ) {}

  async performTasks() {
    this.logger.log('Performing tasks');
    await this.jobsMaintenance.performTasks();
    await this.customersMaintenance.performTasks();
    await this.logMaintenance.performTasks();
    await this.materialsMaintenance.performTasks();
    await this.equipmentMaintenance.performTasks();
    await this.productionStagesMaintenance.performTasks();

    await this.transportationMaintenance.performTasks();
    await this.client.close();
  }
}
