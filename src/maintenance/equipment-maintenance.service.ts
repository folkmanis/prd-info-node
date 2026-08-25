import { Inject, Injectable, Logger } from '@nestjs/common';
import { EQUIPMENT_COLLECTION } from '../entities/equipment/dao/equipment-provider.js';
import { Collection } from 'mongodb';

@Injectable()
export class EquipmentMaintenanceService {
  private logger = new Logger('Equipment Maintenance');

  constructor(@Inject(EQUIPMENT_COLLECTION) private collection: Collection) {}

  async performTasks() {
    await this.deleteEmptyDescription();
    await this.deleteEmptyFields();
    await this.addDisabledField();
    await this.createIndexes();
  }

  private async deleteEmptyDescription() {
    this.logger.log(`Deleting empy description field`);
    const result = await this.collection.updateMany(
      { description: '' },
      { $unset: { description: '' } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async deleteEmptyFields() {
    this.logger.log(`Deleting empy fields`);
    const result = await this.collection.updateMany(
      {}, // Match all documents
      [
        {
          $set: {
            // Convert document to an array of k/v pairs, filter out nulls, convert back to object
            rootAsArray: {
              $filter: {
                input: { $objectToArray: '$$ROOT' },
                cond: { $ne: ['$$this.v', null] },
              },
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $arrayToObject: '$rootAsArray' },
          },
        },
      ],
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async addDisabledField() {
    this.logger.log(`Ensuring "disabled" field`);

    const result = await this.collection.updateMany(
      {
        $or: [{ disabled: { $exists: false } }, { disabled: null }],
      },
      { $set: { disabled: false } },
    );
    this.logger.log(
      `Processed ${result.matchedCount}, updated ${result.modifiedCount} records`,
    );
  }

  private async createIndexes(): Promise<void> {
    this.logger.log(`Ensuring indices`);

    await this.collection.createIndexes([
      {
        key: { name: 1 },
        unique: true,
      },
      {
        key: { disabled: 1 },
      },
    ]);
  }
}
