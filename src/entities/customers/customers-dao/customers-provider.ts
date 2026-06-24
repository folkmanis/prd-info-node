import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const CUSTOMERS_COLLECTION = Symbol('CUSTOMERS_COLLECTION');

export const provideCustomersCollection: FactoryProvider = {
  provide: CUSTOMERS_COLLECTION,
  useFactory: async (client: MongoClient) => {
    const collection = client.db().collection('customers');
    return collection;
  },
  inject: [MONGO_CLIENT],
};
