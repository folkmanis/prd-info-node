import { FactoryProvider } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../../../database/database.service.js';

export const USERS = 'users-collection';

export const usersProvider: FactoryProvider = {
  provide: USERS,
  useFactory: (dbService: DatabaseService) => {
    const collection = dbService.db().collection('users');
    createIndexes(collection);
    return collection;
  },
  inject: [DatabaseService],
};

async function createIndexes(collection: Collection) {
  try {
    await collection.createIndexes([
      {
        key: { username: 1 },
        name: 'username',
        unique: true,
      },
      {
        key: { 'google.id': 1 },
        name: 'googleId',
      },
    ]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
