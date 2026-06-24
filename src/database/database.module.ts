import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import { provideMongoConnection } from './mongo-connection.provider.js';

@Global()
@Module({
  providers: [provideMongoConnection, DatabaseService],
  exports: [provideMongoConnection, DatabaseService],
})
export class DatabaseModule {}
