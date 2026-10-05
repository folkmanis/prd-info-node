import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const TRANSPORTATION_ROUTE_SHEET_COLLECTION = Symbol(
  'TRANSPORTATION_ROUTE_SHEET_COLLECTION',
);

export const provideTransportationRouteSheetCollection: FactoryProvider = {
  provide: TRANSPORTATION_ROUTE_SHEET_COLLECTION,
  useFactory: async (client: MongoClient) => {
    const collection = client.db().collection('transportationRouteSheets');
    return collection;
  },
  inject: [MONGO_CLIENT],
};
