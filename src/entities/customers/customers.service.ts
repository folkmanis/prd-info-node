import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CustomersDaoService } from './customers-dao/customers-dao.service.js';
import { Customer } from './entities/customer.entity.js';
import { ListCustomer } from './dto/list-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly customersDao: CustomersDaoService) {}

  async getCustomerByName(name: string): Promise<Customer> {
    const customer = await this.customersDao.getCustomerByName(name);
    if (!customer) {
      throw new UnprocessableEntityException(`Customer ${name} not found`);
    }
    return customer;
  }

  async getCustomersWithLocation(): Promise<ListCustomer[]> {
    const projection = {
      CustomerName: 1,
      shippingAddress: 1,
    };
    return await this.customersDao.getCustomers(
      {
        filter: { 'shippingAddress.googleId': { $ne: null }, disabled: false },
        start: 0,
        limit: 1000,
      },
      projection,
    );
  }
}
