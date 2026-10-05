import { Inject, Injectable, Logger } from '@nestjs/common';
import { TRANSPORTATION_DRIVER_COLLECTION } from '../../entities/transportation/dao/driver-provider.js';
import { Collection } from 'mongodb';
import {
  addDisabledField,
  deleteEmptyDescription,
  deleteEmptyFields,
  testAgainstSchema,
} from '../maintenance-tools.js';
import { TransportationDriverSchema } from '../../entities/transportation/entities/driver.entity.js';

@Injectable()
export class DriverMaintenanceService {
  private logger = new Logger(`Transportation Driver Maintenance`);

  constructor(
    @Inject(TRANSPORTATION_DRIVER_COLLECTION) private collection: Collection,
  ) {}

  async performTasks() {
    await deleteEmptyDescription(this.collection, this.logger);
    await deleteEmptyFields(this.collection, this.logger);
    await addDisabledField(this.collection, this.logger);
    await this.createIndexes();
    await testAgainstSchema(
      TransportationDriverSchema,
      this.collection,
      this.logger,
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
          disabled: 1,
        },
      },
    ]);
  }
}
