import { Collection, Db } from "mongodb";
import { Invoice, InvoiceResponse, InvoicesFilter, InvoiceUpdate, INVOICE_SCHEMA } from '../interfaces';
import { Dao } from '../interfaces/dao.interface';
import Logger from '../lib/logger';

const INVOICES_COLLECTION_NAME = 'invoices';

export class InvoicesDao extends Dao {

    invoices!: Collection<Invoice>;

    async injectDb(db: Db): Promise<void> {
        if (this.invoices) { return; }
        try {
            this.invoices = db.collection(INVOICES_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Invoices DAO', err);
        }
        await this.createCollection(db);
        this.createIndexes();
    }

    async getInvoices(filter?: InvoicesFilter): Promise<InvoiceResponse> {
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
            const result = await this.invoices.aggregate(pipeline).toArray();
            return {
                error: null,
                data: result,
            };
        } catch (error) { return { error }; }
    }

    async getInvoice(invoiceId: string): Promise<Invoice> {
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

        const result = await this.invoices.aggregate(aggr).toArray();
        return result[0] || undefined;
    }

    async insertInvoice(inv: Invoice): Promise<InvoiceResponse> {
        const result = await this.invoices.insertOne(inv);
        return {
            error: !result.result.ok,
            result: result.result,
            insertedId: result.insertedId,
            data: result.ops.pop(),
        };
    }

    async updateInvoice(invoiceId: string, update: InvoiceUpdate): Promise<number> {
        const result = await this.invoices.updateOne(
            { invoiceId },
            { $set: update }
        );
        return result.modifiedCount;
    }

    async deleteInvoice(invoiceId: string): Promise<number> {
        const result = await this.invoices.deleteOne({ invoiceId });
        return result.deletedCount || 0;
    }

    private async createCollection(db: Db): Promise<void> {
        try {
            await db.createCollection(INVOICES_COLLECTION_NAME, {
                validator: {
                    $jsonSchema: INVOICE_SCHEMA,
                }
            });
        } catch (_) { return; }
    }

    private createIndexes(): void {
        this.invoices.createIndexes(
            [
                {
                    key: { invoiceId: 1 },
                    unique: true,
                }
            ]
        );
    }
}