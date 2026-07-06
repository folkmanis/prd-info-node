import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb/mongodb.js';
import { MONGO_CLIENT } from '../../database/mongo-connection.provider.js';

const PREFERENCES_COLLECTION_NAME = 'preferences';

export const PREFERENCES_COLLECTION = Symbol('preferences');

export const providePreferencesCollection: FactoryProvider = {
  provide: PREFERENCES_COLLECTION,
  inject: [MONGO_CLIENT],
  useFactory: async (client: MongoClient) => {
    const db = client.db();

    const collection = db.collection(PREFERENCES_COLLECTION_NAME);

    await collection.createIndex(
      { module: 1 },
      { unique: true, name: 'module_1' },
    );

    return collection;
  },
};
