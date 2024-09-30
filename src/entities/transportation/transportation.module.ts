import { Module } from '@nestjs/common';
import { TransportationController } from './transportation.controller.js';
import { TransportationService } from './transportation.service.js';
import { TransportationRouteSheetDaoService } from './dao/route-sheet-dao.service.js';
import { transportationRouteSheetCollectionProvider } from './dao/route-sheet-provider.js';
import { transportationDriverCollectionProvider } from './dao/driver-provider.js';
import { transportationVehicleCollectionProvider } from './dao/vehicle-provider.js';
import { TransportationDriverDaoService } from './dao/driver-dao.service.js';
import { TransportationVehicleDaoService } from './dao/vehicle-dao.service.js';
import { VehicleService } from './vehicle.service.js';
import { VehicleController } from './vehicle.controller.js';
import { DriverService } from './driver.service.js';
import { DriverController } from './driver.controller.js';
import { CustomersModule } from '../customers/customers.module.js';
import { GoogleModule } from '../../google/google.module.js';

@Module({
  controllers: [DriverController, VehicleController, TransportationController],
  providers: [
    TransportationService,
    TransportationRouteSheetDaoService,
    DriverService,
    VehicleService,
    TransportationDriverDaoService,
    TransportationVehicleDaoService,
    transportationRouteSheetCollectionProvider,
    transportationDriverCollectionProvider,
    transportationVehicleCollectionProvider,
  ],
  imports: [CustomersModule, GoogleModule],
})
export class TransportationModule {}
