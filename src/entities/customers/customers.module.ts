import { Module, FactoryProvider } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { DatabaseService } from '../../database';
import { CustomersDaoService } from './customers-dao/customers-dao.service';

const collectionProvider: FactoryProvider = {
  provide: 'COLLECTION',
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
    ]);

    return collection;
  },
  inject: [DatabaseService],
};


@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    collectionProvider,
    CustomersDaoService,
  ]
})
export class CustomersModule { }
