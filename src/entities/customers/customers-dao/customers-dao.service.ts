import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Collection, FilterQuery, ObjectId } from 'mongodb';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { ListCustomer } from '../dto/list-customer.dto';
import { StartAndLimit } from '../../../lib/start-and-limit';

@Injectable()
export class CustomersDaoService {

    constructor(
        @Inject('COLLECTION') private collection: Collection<Customer>,
    ) { }


    async getCustomers({ start, limit, filter: nameFilter }: StartAndLimit, disabled: boolean | undefined): Promise<ListCustomer[]> {
        const filter: FilterQuery<Customer> = {};
        if (!disabled) {
            filter.$or = [
                { disabled: { $exists: false } },
                { disabled: false }
            ];
        }
        if (nameFilter) {
            filter.CustomerName = new RegExp(nameFilter, 'i');
        }
        return this.collection
            .find(filter)
            .project({
                _id: 1,
                CustomerName: 1,
                code: 1,
                disabled: 1,
            })
            .sort({ CustomerName: 1 })
            .skip(start)
            .limit(limit)
            .toArray();
    }

    async getCustomerById(_id: ObjectId): Promise<Customer | null> {
        const customer = await this.collection.findOne({ _id });
        if (!customer) {
            throw new NotFoundException(`User with id ${_id} not found in database`);
        }
        return customer;
    }

    async insertOne(customer: CreateCustomerDto): Promise<Customer> {
        const { CustomerName } = customer;
        const { value } = await this.collection
            .findOneAndReplace(
                { CustomerName },
                customer,
                { returnDocument: 'after', upsert: true }
            );
        if (!value) {
            throw new UnprocessableEntityException(CustomerName);
        }
        return value;
    }

    async insertMany(cust: Customer[]): Promise<number> {
        const { insertedCount } = await this.collection.insertMany(cust);
        return insertedCount;
    }

    async deleteOne(_id: ObjectId): Promise<number> {
        const { deletedCount } = await this.collection.deleteOne({ _id });
        return deletedCount || 0;
    }

    async updateOne(_id: ObjectId, customer: UpdateCustomerDto,): Promise<Customer> {
        const { value } = await this.collection.findOneAndUpdate(
            { _id },
            { $set: customer },
            { returnDocument: 'after' }
        );
        if (!value) {
            throw new UnprocessableEntityException(_id);
        }
        return value;
    }

    async validate<K extends keyof Customer>(
        property: K,
    ): Promise<Customer[K][]> {
        return await this.collection
            .find({})
            .project({ _id: 0, [property]: 1 })
            .map((data) => data[property])
            .toArray();
    }

}
