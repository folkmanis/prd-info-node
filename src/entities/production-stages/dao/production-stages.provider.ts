import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';
import { Collection } from 'mongodb';

export const PRODUCTION_STAGES_COLLECTION = 'PRODUCTION_STAGES_COLLECTION';

export const productionStagesProvidder: FactoryProvider = {
  provide: PRODUCTION_STAGES_COLLECTION,
  useFactory: (dbService: DatabaseService) => {
    try {
      const collection = dbService.db().collection('productionStages');
      createIndexes(collection);
      return collection;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  inject: [DatabaseService],
};

function createIndexes(collection: Collection): void {
  collection.createIndexes([
    {
      key: { name: 1 },
      unique: true,
    },
  ]);
}
