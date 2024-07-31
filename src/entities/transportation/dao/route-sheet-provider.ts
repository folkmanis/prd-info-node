import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';

export const TRANSPORTATION_ROUTE_SHEET_COLLECTION =
  'TRANSPORTATION_ROUTE_SHEET_COLLECTION';

export const transportationRouteSheetCollectionProvider: FactoryProvider = {
  provide: TRANSPORTATION_ROUTE_SHEET_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const collection = dbService.db().collection('transportationRouteSheets');
    return collection;
  },
  inject: [DatabaseService],
};
