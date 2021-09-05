import { Module, Global, FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

const connectionFactory: FactoryProvider<Promise<MongoClient>> = {
  provide: 'MONGO_CLIENT',
  useFactory: async (conf: ConfigService) =>
    MongoClient.connect(conf.get('DB_SRV')!, {
      poolSize: 50,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      connectTimeoutMS: 5000,
      writeConcern: {
        wtimeout: 2500,
      },
    }),
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [connectionFactory, DatabaseService],
  exports: ['MONGO_CLIENT', DatabaseService],
})
export class DatabaseModule {}
