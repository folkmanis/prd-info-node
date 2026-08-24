import { FactoryProvider } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../../database/mongo-connection.provider.js';

export const EQUIPMENT_COLLECTION = Symbol('EQUIPMENT_COLLECTION');
const EQUIPMENT_COLLECTION_NAME = 'equipment';

export const provideEquipmentCollection: FactoryProvider = {
  provide: EQUIPMENT_COLLECTION,
  useFactory: async (client: MongoClient) => {
    const collection = client.db().collection(EQUIPMENT_COLLECTION_NAME);
    return collection;
  },
  inject: [MONGO_CLIENT],
};
