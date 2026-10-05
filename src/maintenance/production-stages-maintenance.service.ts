import { Inject, Injectable, Logger } from '@nestjs/common';
import { PRODUCTION_STAGES_COLLECTION } from '../entities/production-stages/dao/production-stages.provider.js';
import { Collection } from 'mongodb';
import {
  addDisabledField,
  deleteEmptyDescription,
  deleteEmptyFields,
} from './maintenance-tools.js';

@Injectable()
export class ProductionStagesMaintenanceService {
  private logger = new Logger('Production Stages Maintenance');

  constructor(
    @Inject(PRODUCTION_STAGES_COLLECTION) private collection: Collection,
  ) {}

  async performTasks() {
    await deleteEmptyDescription(this.collection, this.logger);
    await deleteEmptyFields(this.collection, this.logger);
    await addDisabledField(this.collection, this.logger);

    await this.createIndexes();
  }

  private async createIndexes() {
    this.collection.createIndexes([
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
