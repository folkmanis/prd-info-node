import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';
import { Collection } from 'mongodb/mongodb.js';

const JOBS_COLLECTION_NAME = 'jobs';

export const JOBS_COLLECTION = 'JOBS_COLLECTION';

export const jobsCollectionProvider: FactoryProvider = {
  provide: JOBS_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const db = dbService.db();

    const collection = db.collection(JOBS_COLLECTION_NAME);

    await setDefaultProduction(collection);

    return collection;
  },
  inject: [DatabaseService],
};

async function setDefaultProduction(collection: Collection) {
  return collection.updateMany(
    { 'production.category': null },
    { $set: { 'production.category': 'repro' } },
  );
}
