import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject, FilterQuery } from "mongodb";
import Logger from '../lib/logger';
import { Customer, Result, CustomerResult } from '../lib/customers-interface';

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
            query.disabled = false;
        }
        return await customers.find(query)
            .project({
                _id: 1,
                "CustomerName": 1,
                code: 1,
            })
            .sort({ CustomerName: 1 })
            .toArray();
    }

    static async getCustomerById(id: string): Promise<Customer | null> {
        return await customers.findOne({ _id: new ObjectId(id) });
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

    static async deleteCustomer(id: string): Promise<Result> {
        try {
            const result = await customers.deleteOne({ _id: new ObjectId(id) });
            Logger.info(`Customer ${id} delete request`, result.result);
            return result.result;

        } catch (error) {
            Logger.error('Customer delete failed', { id, error });
            return { n: 0, ok: 0 };
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

    static async validate(property: keyof Customer): Promise<CustomerResult> {
        const result = (await customers.find({}).project({ _id: 0, [property]: 1 }).toArray())
            .map((doc: Partial<Customer>) => doc[property]);
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