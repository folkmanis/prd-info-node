import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId, WithId } from 'mongodb';
import { isFound } from '../../lib/assertions.js';
import { CustomersDaoService } from './customers-dao/customers-dao.service.js';
import { CreateCustomer } from './dto/create-customer.dto.js';
import { CustomerList } from './dto/customer-list.dto.js';
import { CustomersQuery } from './dto/customers-query.js';
import { UpdateCustomer } from './dto/update-customer.dto.js';
import { Customer } from './entities/customer.entity.js';

@Injectable()
export class CustomersService {
  constructor(private readonly customersDao: CustomersDaoService) {}

  async getCustomerById(id: ObjectId): Promise<WithId<Customer>> {
    return isFound(this.customersDao.getCustomerById(id));
  }

  async getCustomerByName(name: string): Promise<WithId<Customer>> {
    return isFound(this.customersDao.getCustomerByName(name));
  }

  async getCustomers(query: CustomersQuery): Promise<WithId<CustomerList>[]> {
    return this.customersDao.getCustomers(query);
  }

  async getCustomersWithLocation(): Promise<
    WithId<Pick<Customer, 'customerName' | 'shippingAddress'>>[]
  > {
    return this.customersDao.getCustomersWithLocation();
  }

  async insertOne(customer: CreateCustomer): Promise<WithId<Customer>> {
    return isFound(this.customersDao.insertOne(customer));
  }

  async updateOne(
    id: ObjectId,
    update: UpdateCustomer,
  ): Promise<WithId<Customer>> {
    return isFound(this.customersDao.updateOne(id, update));
  }

  async deleteOne(id: ObjectId): Promise<number> {
    const deletedCount = await this.customersDao.deleteOne(id);
    if (deletedCount === 0) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return deletedCount;
  }

  async validateProperty<K extends keyof Customer>(
    key: K,
    value: Customer[K],
  ): Promise<boolean> {
    const pattern = `^${value}$`;
    const result = await this.customersDao.validateProperty({
      [key]: new RegExp(pattern, 'i'),
    });
    return Boolean(result);
  }
}
