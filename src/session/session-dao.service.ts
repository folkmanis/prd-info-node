import { FactoryProvider, Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { DatabaseService } from '../database/index.js';
import { SessionEntity } from './session.entity.js';

export const SESSION_COLLECTION = 'SESSION_COLLECTION';
export const sessionProvider: FactoryProvider = {
  provide: SESSION_COLLECTION,
  inject: [DatabaseService],
  useFactory: (dbService: DatabaseService) => {
    return dbService.db().collection('sessions');
  },
};

@Injectable()
export class SessionDaoService {
  constructor(
    @Inject(SESSION_COLLECTION)
    private readonly collection: Collection<SessionEntity>,
  ) { }

  async findSession(id: string): Promise<SessionEntity | null> {
    return this.collection.findOne({ _id: id });
  }
}
