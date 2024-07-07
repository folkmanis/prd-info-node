import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CustomersDaoService } from './customers-dao/customers-dao.service.js';
import { Customer } from './entities/customer.entity.js';

@Injectable()
export class CustomersService {
  constructor(private readonly customersDao: CustomersDaoService) { }

  async getCustomerByName(name: string): Promise<Customer> {
    const customer = await this.customersDao.getCustomerByName(name);
    if (!customer) {
      throw new UnprocessableEntityException(`Customer ${name} not found`);
    }
    return customer;
  }
}
