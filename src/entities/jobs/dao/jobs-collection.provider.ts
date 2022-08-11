import { FactoryProvider } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DatabaseService } from '../../../database';

const JOBS_COLLECTION_NAME = 'jobs';

export const JOBS_COLLECTION = 'JOBS_COLLECTION';

export const jobsCollectionProvider: FactoryProvider = {
  provide: JOBS_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const db = dbService.db();

    const collection = db.collection(JOBS_COLLECTION_NAME);

    return collection;
  },
  inject: [DatabaseService],
};



