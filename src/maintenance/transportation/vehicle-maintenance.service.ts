import { Inject, Injectable, Logger } from '@nestjs/common';
import { Collection } from 'mongodb';
import { TRANSPORTATION_VEHICLE_COLLECTION } from '../../entities/transportation/dao/vehicle-provider.js';
import {
  addDisabledField,
  deleteEmptyDescription,
  deleteEmptyFields,
  testAgainstSchema,
} from '../maintenance-tools.js';
import { TransportationVehicleSchema } from '../../entities/transportation/index.js';

@Injectable()
export class VehicleMaintenanceService {
  private logger = new Logger('Transportation Vehicle Maintenance');

  constructor(
    @Inject(TRANSPORTATION_VEHICLE_COLLECTION) private collection: Collection,
  ) {}

  async performTasks() {
    await deleteEmptyDescription(this.collection, this.logger);
    await deleteEmptyFields(this.collection, this.logger);
    await addDisabledField(this.collection, this.logger);
    await this.ensureOdometerReadingsField();
    await this.createIndexes();
    await testAgainstSchema(
      TransportationVehicleSchema,
      this.collection,
      this.logger,
    );
  }

  private async ensureOdometerReadingsField() {
    this.logger.log(`Ensuring odometerReadings field`);

    const result = await this.collection.updateMany(
      { odometerReadings: { $exists: false } },
      {
        $set: {
          odometerReadings: [],
        },
      },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async createIndexes() {
    await this.collection.createIndexes([
      {
        key: {
          name: 1,
        },
        unique: true,
      },
      {
        key: {
          licencePlate: 1,
        },
        unique: true,
      },
      {
        key: {
          disabled: 1,
        },
      },
    ]);
  }
}
