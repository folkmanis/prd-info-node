import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';

export const TRANSPORTATION_ROUTE_SHEET_COLLECTION =
  'TRANSPORTATION_ROUTE_SHEET_COLLECTION';

export const transportationRouteSheetCollectionProvider: FactoryProvider = {
  provide: TRANSPORTATION_ROUTE_SHEET_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const collection = dbService.db().collection('transportationRouteSheets');
    await collection.createIndexes([
      {
        key: {
          year: 1,
        },
      },
      {
        key: {
          month: 1,
        },
      },
      {
        key: {
          year: -1,
          month: -1,
        },
      },
      {
        key: {
          'driver.name': 1,
        },
      },
      {
        key: {
          'vehicle.licencePlate': 1,
        },
      },
    ]);
    return collection;
  },
  inject: [DatabaseService],
};
