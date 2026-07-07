import { FactoryProvider } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const MATERIALS_COLLECTION = 'MATERIALS_COLLECTION';

export const provideMaterialsCollection: FactoryProvider = {
  provide: MATERIALS_COLLECTION,
  useFactory: (client: MongoClient) => {
    try {
      const collection = client.db().collection('materials');
      createIndexes(collection);
      return collection;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  inject: [MONGO_CLIENT],
};

function createIndexes(collection: Collection): void {
  collection.createIndexes([
    {
      key: { name: 1 },
      unique: true,
    },
  ]);
}
