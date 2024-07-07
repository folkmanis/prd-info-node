import { FactoryProvider } from '@nestjs/common';
import { DatabaseService } from '../../../database/index.js';
import { Collection } from 'mongodb';
import { Veikals } from '../entities/veikals.js';

export const VEIKALI = 'kastes-kastes';

export const veikaliProvider: FactoryProvider = {
  provide: VEIKALI,
  useFactory: async (dbService: DatabaseService) => {
    try {
      const db = dbService.db();
      const collection = db.collection<Veikals>('kastes-kastes');

      await upgradeDb(collection);
      createIndexes(collection);

      return collection;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },

  inject: [DatabaseService],
};

function upgradeDb(collection: Collection<Veikals>) {
  return collection.updateMany(
    {
      lastModified: { $exists: false },
    },
    {
      $currentDate: {
        lastModified: true,
      },
    },
  );
}

function createIndexes(collection: Collection<Veikals>) {
  return collection.createIndexes([
    {
      key: {
        pasutijums: 1,
        kods: 1,
      },
      name: 'pasutijums_1',
    },
    {
      key: {
        lastModified: 1,
      },
    },
  ]);
}
