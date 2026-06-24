import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, FindOptions, ObjectId, WithId } from 'mongodb';
import { from, map, Observable } from 'rxjs';
import { isFound } from '../../../lib/assertions.js';
import { CreateCustomer } from '../dto/create-customer.dto.js';
import {
  CustomerList,
  CUSTOMERS_LIST_DEFAULT_PROJECTION,
} from '../dto/customer-list.dto.js';
import { CustomersQuery } from '../dto/customers-query.js';
import { UpdateCustomer } from '../dto/update-customer.dto.js';
import { Customer } from '../entities/customer.entity.js';
import { CUSTOMERS_COLLECTION } from './customers-provider.js';

@Injectable()
export class CustomersDaoService {
  constructor(
    @Inject(CUSTOMERS_COLLECTION)
    private readonly collection: Collection<Customer>,
  ) {}

  async getCustomers(
    { start, limit, filter }: CustomersQuery,
    projection: FindOptions<Customer>['projection'] = CUSTOMERS_LIST_DEFAULT_PROJECTION,
  ): Promise<CustomerList[]> {
    return this.collection
      .find(filter, {
        projection: projection,
        sort: {
          customerName: 1,
        },
        skip: start,
        limit,
      })
      .toArray();
  }

  async getCustomersWithLocation(): Promise<
    WithId<Pick<Customer, 'customerName' | 'shippingAddress'>>[]
  > {
    const filter = {
      'shippingAddress.googleId': { $ne: null },
      disabled: false,
    };
    const projection = {
      customerName: 1,
      shippingAddress: 1,
    };
    const sort = {
      customerName: 1 as 1,
    };

    return this.collection
      .find(filter, {
        projection,
        sort,
      })
      .toArray();
  }

  async getCustomerById(_id: ObjectId): Promise<WithId<Customer> | null> {
    return this.collection.findOne({ _id });
  }

  getCustomerByIdRx(id: ObjectId): Observable<WithId<Customer>> {
    return from(this.getCustomerById(id)).pipe(map((c) => isFound(c)));
  }

  async getCustomerByName(
    customerName: string,
  ): Promise<WithId<Customer> | null> {
    return this.collection.findOne({ customerName });
  }

  async insertOne(customer: CreateCustomer): Promise<WithId<Customer> | null> {
    const { customerName } = customer;
    return this.collection.findOneAndReplace({ customerName }, customer, {
      returnDocument: 'after',
      upsert: true,
    });
  }

  async deleteOne(_id: ObjectId): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ _id });
    return deletedCount;
  }

  async updateOne(
    _id: ObjectId,
    update: UpdateCustomer,
  ): Promise<WithId<Customer> | null> {
    return this.collection.findOneAndUpdate({ _id }, update, {
      returnDocument: 'after',
    });
  }

  async validateProperty(filter: Filter<Customer>): Promise<1 | 0> {
    return this.collection.countDocuments(filter, { limit: 1 }) as Promise<
      1 | 0
    >;
  }
}
