import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('MONGO_CLIENT') private connection: MongoClient,
  ) { }

  db(): Db {
    return this.connection.db();
  }

  close(force = false) {
    return this.connection.close(force);
  }
}
