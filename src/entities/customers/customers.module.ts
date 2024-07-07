import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { CustomersDaoService } from './customers-dao/customers-dao.service.js';
import { customersCollectionProvider } from './customers-dao/customers-provider.js';
import { NotificationsModule } from '../../notifications/index.js';
import { MessagesModule } from '../../messages/index.js';

@Module({
  imports: [NotificationsModule, MessagesModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    customersCollectionProvider,
    CustomersDaoService,
  ],
  exports: [CustomersService],
})
export class CustomersModule { }
