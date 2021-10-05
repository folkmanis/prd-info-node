import { Inject, Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomersQuery } from '../dto/customers-query';
import { ListCustomer } from '../dto/list-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../entities/customer.entity';
import { CUSTOMERS_COLLECTION } from './customers-provider';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';

@Injectable()
export class CustomersDaoService {

    constructor(
        @Inject(CUSTOMERS_COLLECTION) private readonly collection: Collection<Customer>,
    ) { }


    async getCustomers({ start, limit, filter }: FilterType<Customer>): Promise<ListCustomer[]> {
        return this.collection
            .find(
                filter,
                {
                    projection: {
                        _id: 1,
                        CustomerName: 1,
                        code: 1,
                        disabled: 1,
                    },
                    sort: {
                        CustomerName: 1
                    },
                    skip: start,
                    limit,
                }
            )
            .toArray();
    }

    async getCustomerById(_id: ObjectId): Promise<Customer | null> {
        const customer = await this.collection.findOne({ _id });
        return customer;
    }

    async getCustomerByName(CustomerName: string): Promise<Customer | null> {
        return this.collection.findOne({ CustomerName });
    }

    async insertOne(customer: CreateCustomerDto): Promise<Customer | undefined> {
        const { CustomerName } = customer;
        const { value } = await this.collection
            .findOneAndReplace(
                { CustomerName },
                customer,
                { returnDocument: 'after', upsert: true }
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

    async updateOne(_id: ObjectId, customer: UpdateCustomerDto,): Promise<Customer | undefined> {
        const { value } = await this.collection.findOneAndUpdate(
            { _id },
            { $set: customer },
            { returnDocument: 'after' }
        );
        return value;
    }

    async validate<K extends keyof Customer>(property: K): Promise<Customer[K][]> {
        return await this.collection
            .find(
                {},
                {
                    projection: { _id: 0, [property]: 1 }
                }
            )
            .map(data => data[property])
            .toArray();
    }

}
