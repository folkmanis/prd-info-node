import { MongoClient, Collection, ObjectId, FilterQuery } from "mongodb";
import Logger from '../lib/logger';
import { Invoice, INVOICE_SCHEMA, InvoiceResponse, InvoicesFilter, InvoiceUpdate } from '../interfaces';

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

    static async getInvoice(invoiceId: string): Promise<Invoice> {
        const aggr = [{
            $match: { invoiceId }
        }, {
            $unwind: {
                path: '$products',
                preserveNullAndEmptyArrays: true,
            }
        }, {
            $lookup: {
                from: 'products',
                let: { 'product': '$products' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$$product._id', '$name'], },
                            paytraqId: { '$exists': true }
                        }
                    },
                    {
                        $project: {
                            paytraqId: 1,
                            _id: 0
                        }
                    }
                ],
                as: 'paytraqId'
            }
        }, {
            $addFields: {
                products: {
                    $mergeObjects: [
                        '$products',
                        { $arrayElemAt: ['$paytraqId', 0] }
                    ]
                }
            }
        }, {
            $group: {
                _id: '$invoiceId',
                customer: { $first: '$customer' },
                createdDate: { $first: '$createdDate' },
                jobsId: { $first: '$jobsId' },
                products: { $push: '$products' },
                paytraq: { $first: '$paytraq' },
            }
        }, {
            $lookup: {
                from: 'jobs',
                let: { jobsId: '$jobsId' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$jobId', '$$jobsId'] }
                        }
                    },
                    {
                        $unwind: {
                            path: '$products',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: { _id: 0 }
                    },
                    {
                        $sort: { jobId: 1 }
                    }
                ],
                as: 'jobs'
            }
        }, {
            $addFields: {
                invoiceId: '$_id'
            }
        }, {
            $unset: '_id'
        }];

        const result = await invoices.aggregate(aggr).toArray();
        return result[0] || undefined;
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

    static async updateInvoice(invoiceId: string, update: InvoiceUpdate): Promise<number> {
        const result = await invoices.updateOne(
            { invoiceId },
            { $set: update }
        );
        return result.modifiedCount;
    }

    static async createCollection(conn: MongoClient): Promise<void> {
        try {
            await conn.db(process.env.DB_BASE as string)
                .createCollection(INVOICES_COLLECTION_NAME, {
                    validator: {
                        $jsonSchema: INVOICE_SCHEMA,
                    }
                });
        } catch (_) { return; }
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