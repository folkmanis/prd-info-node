import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject, FilterQuery } from "mongodb";
import Logger from '../lib/logger';
import { Customer, Result } from '../lib/customers-interface';

let customers: Collection<Customer>;
const CUSTOMERS_DB_NAME = 'customers';

export class customersDAO {
    static async injectDB(conn: MongoClient): Promise<void> {
        if (customers) { return; }
        try {
            customers = conn.db(process.env.DB_BASE as string)
                .collection(CUSTOMERS_DB_NAME);
        } catch (err) {
            Logger.error('Customers DAO', err);
        }
        customersDAO.createIndexes();
    }

    static async getCustomers(): Promise<Customer[]> {
        return await customers.find({})
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

    static async insertCustomer(customer: Customer): Promise<{ result: Result, insertedId?: ObjectId; }> {
        try {
            const result = await customers.insertOne(customer);
            Logger.info('Customer created', result.ops);
            return result;
        } catch (error) {
            Logger.error('Customer insert failed', { customer, error });
            return { result: { n: 0, ok: 0 } };
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

    static async updateCustomer(customer: Customer): Promise<Result> {
        const filter = customer._id ? { _id: customer._id } : { 'CustomerName': customer.CustomerName };
        Logger.debug('filter', filter);
        try {
            const result = await customers.updateOne(
                filter,
                { $set: customer },
                { upsert: false }
            );
            Logger.info('Customer updated', { customer, result: result.result });
            return result.result;
        } catch (error) {
            Logger.error('Customer update failed', { customer, error });
            return { n: 0, ok: 0 };
        }
    }

    static async findOneCustomer(filter: FilterQuery<Customer>): Promise<Customer | null> {
        return await customers.findOne(filter);
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