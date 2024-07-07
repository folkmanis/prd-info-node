import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';

export const CUSTOMERS_COLLECTION = 'CUSTOMERS_COLLECTION';

export const customersCollectionProvider: FactoryProvider = {
  provide: CUSTOMERS_COLLECTION,
  useFactory: async (dbService: DatabaseService) => {
    const collection = dbService.db().collection('customers');
    await collection.createIndexes([
      {
        key: {
          CustomerName: 1,
        },
        unique: true,
      },
      {
        key: {
          code: 1,
        },
        unique: true,
        partialFilterExpression: {
          code: { $exists: true },
        },
      },
      {
        key: {
          'contacts.email': 1,
        },
      },
    ]);
    return collection;
  },
  inject: [DatabaseService],
};
