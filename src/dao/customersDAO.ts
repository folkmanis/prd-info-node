import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject, FilterQuery, Db } from "mongodb";
import Logger from '../lib/logger';
import { Customer, CustomerResult } from '../interfaces';
import { Dao } from '../interfaces/dao.interface';

const CUSTOMERS_COLLECTION_NAME = 'customers';

export class CustomersDao extends Dao {

    private customers!: Collection<Customer>;

    async injectDb(db: Db): Promise<void> {
        if (this.customers) { return; }
        try {
            this.customers = db.collection(CUSTOMERS_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Customers DAO', err);
        }
        this.createIndexes();
    }

    async getCustomers(disabled?: boolean): Promise<Customer[]> {
        const query: FilterQuery<Customer> = {};
        if (!disabled) {
            query.$or = [
                { disabled: { $exists: false } },
                { disabled: false },
            ];
        }
        return await this.customers.find(query)
            .project({
                _id: 1,
                "CustomerName": 1,
                code: 1,
                disabled: 1,
            })
            .sort({ CustomerName: 1 })
            .toArray();
    }

    async getCustomer(idOrName: string): Promise<Customer | undefined> {
        const fltr = (/^[a-f\d]{24}$/i).test(idOrName) ? { _id: new ObjectId(idOrName) } : { CustomerName: idOrName };

        return await this.customers.findOne(fltr) || undefined;
    }

    async insertCustomer(customer: Customer): Promise<CustomerResult> {
        try {
            if (!customer.CustomerName) { throw new Error('CustomerName not provided'); }
            const insertResult = await this.customers.findOneAndDelete({ CustomerName: customer.CustomerName })
                .then(() => this.customers.insertOne(customer));
            Logger.info('Customer created', insertResult.insertedId);
            return {
                error: !insertResult.result.ok,
                insertedId: insertResult.insertedId,
            };
        } catch (error) {
            Logger.error('Customer insert failed', { customer, error });
            return { error };
        }
    }

    async insertCustomers(cust: Customer[]): Promise<CustomerResult> {
        if (!(cust && cust.length)) { return { error: null, insertedCount: 0 }; }
        return this.customers.insertMany(cust)
            .then(
                resp => ({
                    error: !resp.result.ok,
                    insertedCount: resp.insertedCount,
                })
            ).catch(error => ({ error }));
    }

    async deleteCustomer(id: string): Promise<CustomerResult> {
        try {
            const result = await this.customers.deleteOne({ _id: new ObjectId(id) });
            Logger.info(`Customer ${id} delete request`, result.result);
            return {
                error: !result.result.ok,
                deletedCount: result.deletedCount,
            };

        } catch (error) {
            Logger.error('Customer delete failed', { id, error });
            return { error };
        }
    }

    async updateCustomer(_id: ObjectId, customer: Partial<Customer>): Promise<CustomerResult> {
        try {
            const result = await this.customers.updateOne(
                { _id },
                { $set: customer },
                { upsert: false }
            );
            Logger.info('Customer update', { _id, customer, result: JSON.stringify(result) });
            return {
                error: !result.result.ok,
                modifiedCount: result.modifiedCount,
            };
        } catch (error) {
            return { error };
        }
    }

    async findOneCustomer(filter: FilterQuery<Customer>): Promise<Customer | null> {
        return await this.customers.findOne(filter);
    }

    async validate<K extends keyof Customer>(property: K): Promise<CustomerResult> {
        const result = await this.customers.find({})
            .project({ _id: 0, [property]: 1 })
            .map(data => data[property])
            .toArray();
        // .map((doc: Partial<Customer>) => doc[property]);
        return {
            validatorData: result,
            error: null,
        };
    }

    private createIndexes() {
        this.customers.createIndexes([
            {
                key: {
                    'CustomerName': 1
                },
                unique: true,
            },
            {
                key: {
                    'code': 1,
                },
                unique: true,
                partialFilterExpression: {
                    'code': { $exists: true }
                }
            }
        ]);
    }

}