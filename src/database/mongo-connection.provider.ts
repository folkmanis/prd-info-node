import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, MongoClientOptions } from 'mongodb';

export const MONGO_CLIENT = Symbol('Mongo Client');

export const provideMongoConnection: FactoryProvider<Promise<MongoClient>> = {
  provide: MONGO_CLIENT,
  useFactory: async (conf: ConfigService) => {
    return new MongoClient(
      conf.get('DB_SRV') as string,
      {
        connectTimeoutMS: 10000,
        writeConcern: {
          wtimeout: 2500,
        },
      } as MongoClientOptions,
    ).connect();
  },
  inject: [ConfigService],
};
