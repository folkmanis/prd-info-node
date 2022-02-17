import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersDaoService } from './customers-dao/customers-dao.service';
import { customersCollectionProvider } from './customers-dao/customers-provider';
import { NotificationsModule } from '../../notifications';
import { MessagesModule } from '../../messages';

@Module({
  imports: [
    NotificationsModule,
    MessagesModule,
  ],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    customersCollectionProvider,
    CustomersDaoService,
  ],
  exports: [CustomersService],
})
export class CustomersModule { }
