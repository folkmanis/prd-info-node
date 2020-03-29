import { MongoClient, Collection, ObjectId } from "mongodb";
import Logger from '../lib/logger';
import { Customer } from '../lib/customers-interface';

let customers: Collection<Customer>;
const CUSTOMERS_DB_NAME = 'customers';

export class customersDAO {
    static async injectDb(conn: MongoClient): Promise<void> {
        if (customers) { return; }
        try {
            customers = conn.db(process.env.DB_BASE as string)
                .collection(CUSTOMERS_DB_NAME);
        } catch (err) {
            Logger.error('Customers DAO', err);
        }
    }

    static async getCustomers(): Promise<string[]> {
        return await customers.find({ disabled: false })
            .sort({ CustomerName: 1 })
            .map(cust => cust.CustomerName)
            .toArray();
    }

}