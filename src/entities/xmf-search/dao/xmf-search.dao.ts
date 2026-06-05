import { Injectable } from '@nestjs/common';
import { flatten } from 'flat';
import { intersection } from 'lodash-es';
import { Collection, Filter, MatchKeysAndValues } from 'mongodb';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from '../../../database/index.js';
import { XmfJobsQuery } from '../dto/xmf-jobs-filter.js';
import { ArchiveJob } from '../entities/xmf-archive.interface.js';

@Injectable()
export class XmfSearchDao {
  private collection: Collection<ArchiveJob>;

  constructor(dbService: DatabaseService) {
    this.collection = dbService.db().collection('xmfarchives');

    this.createIndexes();
  }

  async findJobs(
    { start, limit, ...query }: XmfJobsQuery,
    customers: string[],
  ) {
    const filter = this.createFilter(query, customers);
    return this.collection
      .find(filter, {
        projection: {
          _id: 0,
          JDFJobID: 1,
          DescriptiveName: 1,
          CustomerName: 1,
          'Archives.Location': 1,
          'Archives.Date': 1,
          'Archives.Action': 1,
          'Archives.yearIndex': 1,
          'Archives.monthIndex': 1,
        },
        skip: start,
        limit,
        sort: {
          'Archives.yearIndex': -1,
          'Archives.monthIndex': -1,
          JobID: -1,
        },
      })
      .toArray();
  }

  async getCount(query: XmfJobsQuery, customers: string[]): Promise<number> {
    const filter = this.createFilter(query, customers);
    return this.collection.countDocuments(filter);
  }

  async findFacet(query: XmfJobsQuery, customers: string[]) {
    const filter = this.createFilter(query, customers);
    const pipeline = [
      { $match: filter },
      {
        $facet: {
          customerName: [{ $sortByCount: '$CustomerName' }],
          year: [
            { $unwind: '$Archives' },
            { $match: { 'Archives.Action': 1 } },
            { $group: { _id: '$Archives.yearIndex', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
          ],
          month: [
            { $unwind: '$Archives' },
            { $match: { 'Archives.Action': 1 } },
            { $group: { _id: '$Archives.monthIndex', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ];
    const aggregation = await this.collection.aggregate(pipeline).toArray();
    return aggregation[0];
  }

  async findAllCustomers(): Promise<string[]> {
    const pipeline = [
      {
        $group: {
          _id: '$CustomerName',
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    const customers = await this.collection
      .aggregate<{ _id: string }>(pipeline)
      .toArray();
    return customers.map((res) => res._id);
  }

  private createFilter(
    query: Omit<XmfJobsQuery, 'start' | 'limit'>,
    customers: string[],
  ): Filter<ArchiveJob> {
    const { customerName, search, year, month } = query;
    const filter: Filter<ArchiveJob> = {};

    filter.CustomerName = {
      $in: Array.isArray(customerName)
        ? intersection(customerName, customers)
        : customers,
    };

    if (search) {
      filter['$or'] = [
        { JDFJobID: search },
        { DescriptiveName: { $regex: search, $options: 'i' } },
      ];
    }
    if (year) {
      filter['Archives.yearIndex'] = { $in: year };
    }
    if (month) {
      filter['Archives.monthIndex'] = { $in: month };
    }
    return filter;
  }

  private createIndexes() {
    this.collection.createIndexes([
      { key: { JDFJobID: 1 }, name: 'JDFJobID' },
      {
        key: {
          JobID: 1,
          JDFJobID: 1,
        },
        name: 'JobID_1_JDFJobID_1',
        unique: true,
      },
      {
        key: {
          'Archives.yearIndex': -1,
          'Archives.monthIndex': -1,
          JobID: -1,
        },
        name: 'yearIndex_monthIndex',
      },
    ]);
  }

  insertManyRx(
    jobs: ArchiveJob[],
  ): Observable<{ modifiedCount: number; upsertedCount: number }> {
    if (jobs.length === 0) {
      return of({ modifiedCount: 0, upsertedCount: 0 });
    }

    const update = jobs.map((job) => ({
      updateOne: {
        filter: {
          JobID: job.JobID,
          JDFJobID: job.JDFJobID,
        },
        update: {
          $set: flatten<ArchiveJob, MatchKeysAndValues<ArchiveJob>>(job, {
            safe: true,
          }),
        },
        upsert: true,
      },
    }));

    return from(this.collection.bulkWrite(update)).pipe(
      map(({ modifiedCount, upsertedCount }) => ({
        modifiedCount: modifiedCount || 0,
        upsertedCount: upsertedCount || 0,
      })),
    );
  }
}
