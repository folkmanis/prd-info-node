import { MongoClient, Collection, ObjectId, FilterQuery } from "mongodb";
import Logger from '../lib/logger';
import { Invoice, INVOICE_SCHEMA, InvoiceResponse, InvoicesFilter } from '../interfaces';

let invoices: Collection<Invoice>;
const INVOICES_COLLECTION_NAME = 'invoices';

export class invoicesDAO {
    static async injectDB(conn: MongoClient): Promise<void> {
        if (invoices) { return; }
        try {
            invoices = conn.db(process.env.DB_BASE as string)
                .collection(INVOICES_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Invoices DAO', err);
        }
        await invoicesDAO.createCollection(conn);
        invoicesDAO.createIndexes();
    }

    static async getInvoices(filter?: InvoicesFilter): Promise<InvoiceResponse> {
        const filterQuery: FilterQuery<Invoice> = {};
        if (filter?.customer) {
            filterQuery.customer = filter.customer;
        }
        const result = await invoices.find(
            filterQuery,
            {
                projection: { _id: 0 },
                sort: { invoiceId: -1 },
            }
        ).toArray();
        return {
            error: null,
            data: result,
        };
    }

    static async getInvoice(invoiceId: string): Promise<InvoiceResponse> {
        const aggr = [
            {
                $match: { invoiceId }
            }, {
                $lookup: {
                    'from': 'jobs',
                    'let': { 'jobsId': '$jobsId' },
                    'pipeline': [
                        {
                            $match: { '$expr': { '$in': ['$jobId', '$$jobsId'] } }
                        }, {
                            $unwind: { 'path': '$products' }
                        }, {
                            $project: { _id: 0 },
                        }, {
                            $sort: { receivedDate: 1 },
                        }
                    ],
                    'as': 'jobs'
                }
            }, {
                $sort: { 'jobsId': 1 }
            }, {
                $project: { '_id': 0 }
            }
        ];
        const result = await invoices.aggregate(aggr).toArray();
        return {
            error: !result,
            data: result[0] || undefined,
        };
    }

    static async insertInvoice(inv: Invoice): Promise<InvoiceResponse> {
        const result = await invoices.insertOne(inv);
        return {
            error: !result.result.ok,
            result: result.result,
            insertedId: result.insertedId,
            data: result.ops.pop(),
        };
    }

    static async createCollection(conn: MongoClient): Promise<void> {
        await conn.db(process.env.DB_BASE as string)
            .createCollection(INVOICES_COLLECTION_NAME, {
                validator: {
                    $jsonSchema: INVOICE_SCHEMA,
                }
            });
    }

    static createIndexes(): void {
        invoices.createIndexes(
            [
                {
                    key: { invoiceId: 1 },
                    unique: true,
                }
            ]
        );
    }
}