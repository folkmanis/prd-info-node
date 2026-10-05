import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const TRANSPORTATION_VEHICLE_COLLECTION = Symbol(
  'TRANSPORTATION_VEHICLE_COLLECTION',
);

export const provideTransportationVehicleCollection: FactoryProvider = {
  provide: TRANSPORTATION_VEHICLE_COLLECTION,
  useFactory: (client: MongoClient) => {
    const collection = client.db().collection('transportationVehicles');
    return collection;
  },
  inject: [MONGO_CLIENT],
};
