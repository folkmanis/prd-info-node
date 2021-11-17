import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from '../../../database';
import { ArchiveJob } from '../entities/xmf-archive.interface';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';

@Injectable()
export class XmfSearchDao {

    private db = this.dbService.db();

    private collection: Collection<ArchiveJob> = this.db.collection('xmfarchives');

    constructor(
        private readonly dbService: DatabaseService,
    ) {
        this.createIndexes();
    }


    async findJobs({ start, limit, filter }: FilterType<ArchiveJob>) {
        return this.collection.find(
            filter,
            {
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
                    'JobID': -1,
                }
            }
        )
            .toArray();
    }

    async getCount({ filter }: FilterType<ArchiveJob>): Promise<number> {
        return this.collection.countDocuments(filter);
    }

    async findFacet({ filter }: FilterType<ArchiveJob>) {
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
        const customers = await this.collection.aggregate<{ _id: string; }>(pipeline).toArray();
        return customers.map((res) => res._id);

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
                    'JobID': -1,
                },
                name: 'yearIndex_monthIndex',
            },
        ]);

    }

    insertManyRx(jobs: ArchiveJob[]): Observable<{ modifiedCount: number, upsertedCount: number; }> {
        if (jobs.length === 0) {
            return of({ modifiedCount: 0, upsertedCount: 0 });
        }

        const update = jobs.map(job => ({
            updateOne: {
                filter: {
                    JobID: job.JobID,
                    JDFJobID: job.JDFJobID,
                },
                update: { $set: job },
                upsert: true,
            },
        }));

        return from(this.collection.bulkWrite(update)).pipe(
            map(({ modifiedCount, upsertedCount }) => ({
                modifiedCount: modifiedCount || 0,
                upsertedCount: upsertedCount || 0,
            }))
        );
    }

}
