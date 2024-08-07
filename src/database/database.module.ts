import { Module, Global, FactoryProvider } from '@nestjs/common';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service.js';

const connectionFactory: FactoryProvider<Promise<MongoClient>> = {
  provide: 'MONGO_CLIENT',
  useFactory: async (conf: ConfigService) =>
    new MongoClient(
      conf.get('DB_SRV') as string,
      {
        connectTimeoutMS: 10000,
        writeConcern: {
          wtimeout: 2500,
        },
      } as MongoClientOptions,
    ).connect(),
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [connectionFactory, DatabaseService],
  exports: ['MONGO_CLIENT', DatabaseService],
})
export class DatabaseModule { }
