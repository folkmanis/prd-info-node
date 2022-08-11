import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('MONGO_CLIENT') private connection: MongoClient,
    private config: ConfigService,
  ) { }

  db(): Db {
    return this.connection.db(this.config.get('DB_BASE'));
  }

  close(force = false) {
    return this.connection.close(force);
  }
}
