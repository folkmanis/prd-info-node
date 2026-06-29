import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { MessagesModule } from '../../messages/index.js';
import { NotificationsModule } from '../../notifications/index.js';
import { CustomersDaoService } from './customers-dao/customers-dao.service.js';
import { provideCustomersCollection } from './customers-dao/customers-provider.js';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';

@Module({
  imports: [NotificationsModule, MessagesModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    provideCustomersCollection,
    CustomersDaoService,
  ],
  exports: [CustomersService],
})
export class CustomersModule implements OnApplicationBootstrap {
  constructor(private customersService: CustomersService) {}

  onApplicationBootstrap() {
    this.customersService.watchFtpUserDataChanges().subscribe();
  }
}
