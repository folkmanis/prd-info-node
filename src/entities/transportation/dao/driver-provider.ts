import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';

export const TRANSPORTATION_DRIVER_COLLECTION =
  'TRANSPORTATION_DRIVER_COLLECTION';

export const transportationDriverCollectionProvider: FactoryProvider = {
  provide: TRANSPORTATION_DRIVER_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const collection = dbService.db().collection('transportationDrivers');
    await collection.createIndexes([
      {
        key: {
          name: 1,
        },
        unique: true,
      },
    ]);
    return collection;
  },
  inject: [DatabaseService],
};
