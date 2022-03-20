import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { from, map, Observable, tap } from 'rxjs';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { ListCustomer } from '../dto/list-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../entities/customer.entity';
import { CUSTOMERS_COLLECTION } from './customers-provider';

@Injectable()
export class CustomersDaoService {
  constructor(
    @Inject(CUSTOMERS_COLLECTION)
    private readonly collection: Collection<Customer>,
  ) {}

  async getCustomers({
    start,
    limit,
    filter,
  }: FilterType<Customer>): Promise<ListCustomer[]> {
    return this.collection
      .find(filter, {
        projection: {
          _id: 1,
          CustomerName: 1,
          code: 1,
          disabled: 1,
        },
        sort: {
          CustomerName: 1,
        },
        skip: start,
        limit,
      })
      .toArray();
  }

  async getCustomerById(_id: ObjectId): Promise<Customer | null> {
    return this.collection.findOne({ _id });
  }

  getCustomerByIdRx(id: ObjectId): Observable<Customer> {
    return from(this.getCustomerById(id)).pipe(
      tap((customer) => {
        if (customer === null) throw new NotFoundException(id);
      }),
      map((customer) => customer as Customer),
    );
  }

  async getCustomerByName(CustomerName: string): Promise<Customer | null> {
    return this.collection.findOne({ CustomerName });
  }

  async insertOne(customer: CreateCustomerDto): Promise<Customer | null> {
    const { CustomerName } = customer;
    const { value } = await this.collection.findOneAndReplace(
      { CustomerName },
      customer,
      { returnDocument: 'after', upsert: true },
    );
    return value;
  }

  async insertMany(cust: Customer[]): Promise<number> {
    const { insertedCount } = await this.collection.insertMany(cust);
    return insertedCount;
  }

  async deleteOne(_id: ObjectId): Promise<number | undefined> {
    const { deletedCount } = await this.collection.deleteOne({ _id });
    return deletedCount;
  }

  async updateOne(
    _id: ObjectId,
    customer: UpdateCustomerDto,
  ): Promise<Customer | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { _id },
      { $set: customer },
      { returnDocument: 'after' },
    );
    return value;
  }

  async validate<K extends keyof Customer>(
    property: K,
  ): Promise<Customer[K][]> {
    return await this.collection
      .find(
        {},
        {
          projection: { _id: 0, [property]: 1 },
        },
      )
      .map((data) => data[property])
      .toArray();
  }
}
