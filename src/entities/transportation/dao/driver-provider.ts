import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const TRANSPORTATION_DRIVER_COLLECTION = Symbol(
  'TRANSPORTATION_DRIVER_COLLECTION',
);

export const provideTransportationDriverCollection: FactoryProvider = {
  provide: TRANSPORTATION_DRIVER_COLLECTION,
  useFactory: async (client: MongoClient) => {
    const collection = client.db().collection('transportationDrivers');
    return collection;
  },
  inject: [MONGO_CLIENT],
};
