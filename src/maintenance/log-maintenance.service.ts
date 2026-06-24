import { Inject, Injectable, Logger } from '@nestjs/common';
import { LOG_COLLECTION } from '../logging/logger-dao/log-collection.provider.js';
import { Collection } from 'mongodb';

@Injectable()
export class LogMaintenanceService {
  private logger = new Logger(LogMaintenanceService.name);

  constructor(@Inject(LOG_COLLECTION) private collection: Collection) {}

  async performTasks() {
    this.reCreateIndexes();
  }

  async reCreateIndexes() {
    this.logger.log(`Dropping old indexes`);
    await this.collection.dropIndexes();

    this.logger.log(`Creating indexes`);
    await this.collection.createIndexes([
      {
        key: { timestamp: -1 },
        name: 'timestamp',
        expireAfterSeconds: 60 * 60 * 24 * 7,
      },
      {
        key: { level: 1 },
        name: 'level',
      },
    ]);
  }
}
