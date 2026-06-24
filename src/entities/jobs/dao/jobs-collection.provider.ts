import { FactoryProvider } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb/mongodb.js';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

const JOBS_COLLECTION_NAME = 'jobs';

export const JOBS_COLLECTION = Symbol('JOBS_COLLECTION');

export const provideJobsCollection: FactoryProvider = {
  provide: JOBS_COLLECTION,
  useFactory: async (client: MongoClient) => {
    const db = client.db();

    const collection = db.collection(JOBS_COLLECTION_NAME);

    await setDefaultProduction(collection);

    return collection;
  },
  inject: [MONGO_CLIENT],
};

async function setDefaultProduction(collection: Collection) {
  return collection.updateMany(
    { 'production.category': null },
    { $set: { 'production.category': 'repro' } },
  );
}
