import { DatabaseService } from '../../../database/index.js';
import { FactoryProvider } from '@nestjs/common';
import { Collection } from 'mongodb';

export const MATERIALS_COLLECTION = 'MATERIALS_COLLECTION';

export const materialsCollectionProvider: FactoryProvider = {
  provide: MATERIALS_COLLECTION,
  useFactory: (dbService: DatabaseService) => {
    try {
      const collection = dbService.db().collection('materials');
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
