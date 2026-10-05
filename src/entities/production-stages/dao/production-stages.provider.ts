import { FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const PRODUCTION_STAGES_COLLECTION = Symbol(
  'PRODUCTION_STAGES_COLLECTION',
);
export const PRODUCTION_STAGES_COLLECTION_NAME = 'productionStages';

export const provideProductionStagesCollection: FactoryProvider = {
  provide: PRODUCTION_STAGES_COLLECTION,
  useFactory: (client: MongoClient) => {
    const collection = client
      .db()
      .collection(PRODUCTION_STAGES_COLLECTION_NAME);
    return collection;
  },
  inject: [MONGO_CLIENT],
};
