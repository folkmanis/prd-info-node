import { Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DatabaseService } from '../../../database';
import { InvoiceUpdate } from '../dto/invoice-update.dto';
import { InvoiceForReport } from '../entities/invoice-for-report.interface';
import {
  Invoice,
  InvoiceResponse,
  InvoicesFilter,
  INVOICE_SCHEMA,
} from '../entities/invoice.entity';

@Injectable()
export class InvoicesDao {
  private collection: Collection<Invoice>;
  private readonly INVOICES_COLLECTION_NAME = 'invoices';

  constructor(private dbService: DatabaseService) {
    this.collection = this.dbService
      .db()
      .collection(this.INVOICES_COLLECTION_NAME);
    this.createCollection(dbService.db()).then(() => this.createIndexes());
  }

  async getAll({ customer }: InvoicesFilter): Promise<InvoiceResponse[]> {
    let pipeline: any[] = [
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
    return this.collection.aggregate(pipeline).toArray() as Promise<
      InvoiceResponse[]
    >;
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
              $project: { _id: 0 },
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

  async insertOne(invoice: Invoice): Promise<Invoice | null> {
    const { value } = await this.collection.findOneAndReplace(
      { invoiceId: invoice.invoiceId },
      invoice,
      { upsert: true, returnDocument: 'after' },
    );
    return value;
  }

  async updateInvoice(
    invoiceId: string,
    update: InvoiceUpdate,
  ): Promise<Invoice | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { invoiceId },
      { $set: update },
      { returnDocument: 'after' },
    );
    return value;
  }

  async deleteInvoice(invoiceId: string): Promise<number | undefined> {
    const { deletedCount } = await this.collection.deleteOne({ invoiceId });
    return deletedCount;
  }

  private async createCollection(db: Db) {
    try {
      await db.createCollection(this.INVOICES_COLLECTION_NAME, {
        validator: {
          $jsonSchema: INVOICE_SCHEMA,
        },
      });
    } catch (error) {}
  }

  private createIndexes(): void {
    this.collection.createIndexes([
      {
        key: { invoiceId: 1 },
        unique: true,
      },
    ]);
  }
}
