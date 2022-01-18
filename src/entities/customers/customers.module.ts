import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersDaoService } from './customers-dao/customers-dao.service';
import { customersCollectionProvider } from './customers-dao/customers-provider';

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    customersCollectionProvider,
    CustomersDaoService,
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
