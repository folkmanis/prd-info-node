import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../database/mongo-connection.provider.js';

export const LOG_COLLECTION = Symbol('LOG_COLLECTION');

export const provideLogCollection: FactoryProvider = {
  provide: LOG_COLLECTION,
  inject: [MONGO_CLIENT],
  useFactory: async (client: MongoClient) => {
    const collection = client.db().collection('log');
    return collection;
  },
};
