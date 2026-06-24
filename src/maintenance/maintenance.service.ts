import { Inject, Injectable, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../database/mongo-connection.provider.js';
import { CustomersMaintenanceService } from './customers-maintenace.service.js';
import { JobsMaintenanceService } from './jobs-maintenance.service.js';
import { LogMaintenanceService } from './log-maintenance.service.js';

@Injectable()
export class MaintenanceService {
  private logger = new Logger('Maintenance');

  constructor(
    @Inject(MONGO_CLIENT) private client: MongoClient,
    private customersMaintenance: CustomersMaintenanceService,
    private logMaintenance: LogMaintenanceService,
    private jobsMaintenance: JobsMaintenanceService,
  ) {}

  async performTasks() {
    this.logger.log('Performing tasks');
    await this.jobsMaintenance.performTasks();
    await this.customersMaintenance.performTasks();
    await this.logMaintenance.performTasks();
  }

  async close() {
    await this.client.close();
  }
}
