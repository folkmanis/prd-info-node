import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject, FilterQuery } from "mongodb";
import Logger from '../lib/logger';
import { Customer, CustomerResult } from '../interfaces';

let customers: Collection<Customer>;
const CUSTOMERS_COLLECTION_NAME = 'customers';

export class customersDAO {
    static async injectDB(conn: MongoClient): Promise<void> {
        if (customers) { return; }
        try {
            customers = conn.db(process.env.DB_BASE as string)
                .collection(CUSTOMERS_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Customers DAO', err);
        }
        customersDAO.createIndexes();
    }

    static async getCustomers(disabled?: boolean): Promise<Customer[]> {
        const query: FilterQuery<Customer> = {};
        if (!disabled) {
            query.$or = [
                { disabled: { $exists: false } },
                { disabled: false },
            ];
        }
        return await customers.find(query)
            .project({
                _id: 1,
                "CustomerName": 1,
                code: 1,
                disabled: 1,
            })
            .sort({ CustomerName: 1 })
            .toArray();
    }

    static async getCustomer(fltr: FilterQuery<Customer>): Promise<CustomerResult> {
        try {
            const result = await customers.findOne(fltr);
            return {
                error: false,
                data: result || undefined,
            };

        } catch (error) { return { error }; }
    }

    static async insertCustomer(customer: Customer): Promise<CustomerResult> {
        try {
            if (!customer.CustomerName) { throw new Error('CustomerName not provided'); }
            const insertResult = await customers.findOneAndDelete({ CustomerName: customer.CustomerName })
                .then(() => customers.insertOne(customer));
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

    static async insertCustomers(cust: Customer[]): Promise<CustomerResult> {
        if (!(cust && cust.length)) { return { error: null, insertedCount: 0 }; }
        return customers.insertMany(cust)
            .then(
                resp => ({
                    error: !resp.result.ok,
                    insertedCount: resp.insertedCount,
                })
            ).catch(error => ({ error }));
    }

    static async deleteCustomer(id: string): Promise<CustomerResult> {
        try {
            const result = await customers.deleteOne({ _id: new ObjectId(id) });
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

    static async updateCustomer(_id: ObjectId, customer: Partial<Customer>): Promise<CustomerResult> {
        try {
            const result = await customers.updateOne(
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

    static async findOneCustomer(filter: FilterQuery<Customer>): Promise<Customer | null> {
        return await customers.findOne(filter);
    }

    static async validate<K extends keyof Customer>(property: K): Promise<CustomerResult> {
        const result = await customers.find({})
            .project({ _id: 0, [property]: 1 })
            .map(data => data[property])
            .toArray();
        // .map((doc: Partial<Customer>) => doc[property]);
        return {
            validatorData: result,
            error: null,
        };
    }

    private static createIndexes() {
        customers.createIndexes([
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