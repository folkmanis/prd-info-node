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
        let pipeline: any[] = [
            {
                '$sort': { 'invoiceId': -1 }
            }
        ];
        if (filter?.customer) {
            pipeline = [
                ...pipeline,
                {
                    '$match': { 'customer': filter.customer }
                }
            ];
        }
        pipeline = [
            ...pipeline,
            {
                '$project': {
                    '_id': 0,
                    'invoiceId': 1,
                    'customer': 1,
                    'createdDate': 1,
                    'totals': {
                        '$reduce': {
                            'input': '$products',
                            'initialValue': {
                                'count': 0,
                                'sum': 0
                            },
                            'in': {
                                'count': {
                                    '$add': ['$$value.count', '$$this.count']
                                },
                                'sum': {
                                    '$add': ['$$value.sum', '$$this.total']
                                }
                            }
                        }
                    }
                }
            }
        ];
        try {
            const result = await invoices.aggregate(pipeline).toArray();
            return {
                error: null,
                data: result,
            };
        } catch (error) { return { error }; }
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
                            $unwind: { path: '$products', preserveNullAndEmptyArrays: true, }
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