import { forwardRef, Module } from '@nestjs/common';
import {
  MONGO_CLIENT,
  provideMongoConnection,
} from '../../database/mongo-connection.provider.js';
import { provideTransportationVehicleCollection } from '../../entities/transportation/dao/vehicle-provider.js';
import { provideTransportationDriverCollection } from '../../entities/transportation/dao/driver-provider.js';
import { TransportationMaintenanceService } from './transportation-maintenance.service.js';
import { VehicleMaintenanceService } from './vehicle-maintenance.service.js';
import { DriverMaintenanceService } from './driver-maintenance.service.js';
import { provideTransportationRouteSheetCollection } from '../../entities/transportation/dao/route-sheet-provider.js';
import { RouteSheetMaintenanceService } from './route-sheet-maintenance.service.js';

@Module({
  providers: [
    provideMongoConnection,
    provideTransportationVehicleCollection,
    provideTransportationDriverCollection,
    provideTransportationRouteSheetCollection,
    TransportationMaintenanceService,
    VehicleMaintenanceService,
    DriverMaintenanceService,
    RouteSheetMaintenanceService,
  ],
  exports: [TransportationMaintenanceService],
})
export class TransportationMaintenanceModule {}
