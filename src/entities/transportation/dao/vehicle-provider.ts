import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';

export const TRANSPORTATION_VEHICLE_COLLECTION =
  'TRANSPORTATION_VEHICLE_COLLECTION';

export const transportationVehicleCollectionProvider: FactoryProvider = {
  provide: TRANSPORTATION_VEHICLE_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const collection = dbService.db().collection('transportationVehicles');
    await collection.createIndexes([
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
    ]);
    return collection;
  },
  inject: [DatabaseService],
};
