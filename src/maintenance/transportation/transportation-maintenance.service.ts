import { Inject, Injectable } from '@nestjs/common';
import { VehicleMaintenanceService } from './vehicle-maintenance.service.js';
import { DriverMaintenanceService } from './driver-maintenance.service.js';
import { RouteSheetMaintenanceService } from './route-sheet-maintenance.service.js';
import { MONGO_CLIENT } from '../../database/mongo-connection.provider.js';
import { MongoClient } from 'mongodb';

@Injectable()
export class TransportationMaintenanceService {
  constructor(
    @Inject(MONGO_CLIENT) private client: MongoClient,
    private vehicleMaintenance: VehicleMaintenanceService,
    private driverMaintenance: DriverMaintenanceService,
    private routeSheetMaintenance: RouteSheetMaintenanceService,
  ) {}

  async performTasks() {
    await this.vehicleMaintenance.performTasks();
    await this.driverMaintenance.performTasks();
    await this.routeSheetMaintenance.performTasks();
    await this.client.close();
  }
}
