import { Inject, Injectable } from '@nestjs/common';
import { Collection, Document, WithId } from 'mongodb';
import { InvoiceForList } from '../dto/invoice-for-list.dto.js';
import { InvoiceForReport } from '../dto/invoice-for-report.dto.js';
import { InvoiceUpdate } from '../dto/invoice-update.dto.js';
import { InvoicesFilter } from '../dto/invoices-filter.dto.js';
import { Invoice } from '../entities/invoice.entity.js';
import { INVOICES_COLLECTION } from './invoices-collection.provider.js';

@Injectable()
export class InvoicesDao {
  constructor(
    @Inject(INVOICES_COLLECTION) private collection: Collection<Invoice>,
  ) {}

  async getAll({ customer }: InvoicesFilter): Promise<InvoiceForList[]> {
    let pipeline: Document[] = [
      {
        $sort: { invoiceId: -1 },
      },
    ];
    if (customer) {
      pipeline = [
        ...pipeline,
        {
          $match: { customer },
        },
      ];
    }
    pipeline = [
      ...pipeline,
      {
        $project: {
          _id: 0,
          invoiceId: 1,
          customer: 1,
          createdDate: 1,
          totals: {
            $reduce: {
              input: '$products',
              initialValue: {
                count: 0,
                sum: 0,
              },
              in: {
                count: {
                  $add: ['$$value.count', '$$this.count'],
                },
                sum: {
                  $add: ['$$value.sum', '$$this.total'],
                },
              },
            },
          },
        },
      },
    ];
    return this.collection.aggregate<InvoiceForList>(pipeline).toArray();
  }

  async getOne(invoiceId: string): Promise<InvoiceForReport> {
    const aggr = [
      {
        $match: { invoiceId },
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'products',
          let: { product: '$products' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$$product._id', '$name'] },
                paytraqId: { $exists: true },
              },
            },
            {
              $project: {
                paytraqId: 1,
                _id: 0,
              },
            },
          ],
          as: 'paytraqId',
        },
      },
      {
        $addFields: {
          products: {
            $mergeObjects: ['$products', { $arrayElemAt: ['$paytraqId', 0] }],
          },
        },
      },
      {
        $group: {
          _id: '$invoiceId',
          customer: { $first: '$customer' },
          createdDate: { $first: '$createdDate' },
          jobsId: { $first: '$jobsId' },
          products: { $push: '$products' },
          paytraq: { $first: '$paytraq' },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          let: { jobsId: '$jobsId' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$jobId', '$$jobsId'] },
              },
            },
            {
              $unwind: {
                path: '$products',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                products: 1,
                receivedDate: 1,
                name: 1,
                jobId: 1,
              },
            },
            {
              $sort: { jobId: 1 },
            },
          ],
          as: 'jobs',
        },
      },
      {
        $addFields: {
          invoiceId: '$_id',
        },
      },
      {
        $unset: '_id',
      },
    ];

    const result = await this.collection
      .aggregate<InvoiceForReport>(aggr)
      .toArray();
    return result[0] || undefined;
  }

  async insertOne(invoice: Invoice): Promise<WithId<Invoice> | null> {
    return this.collection.findOneAndReplace(
      { invoiceId: invoice.invoiceId },
      invoice,
      { upsert: true, returnDocument: 'after' },
    );
  }

  async updateInvoice(
    invoiceId: string,
    update: InvoiceUpdate,
  ): Promise<WithId<Invoice> | null> {
    return this.collection.findOneAndUpdate(
      { invoiceId },
      { $set: update },
      { returnDocument: 'after' },
    );
  }

  async deleteInvoice(invoiceId: string): Promise<number> {
    const { deletedCount } = await this.collection.deleteOne({ invoiceId });
    return deletedCount;
  }
}
