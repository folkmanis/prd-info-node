import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { Job } from '../entities/jobs/entities/job.entity';
import { JOBS_COLLECTION } from '../entities/jobs/dao/jobs-collection.provider';
import { AnyBulkWriteOperation, Collection, UpdateFilter } from 'mongodb';
import path from 'path';

const JOBS_COLLECTION_NAME = 'jobs';
const DEFAULT_UNIT = 'gab.';

const JOBS_SCHEMA: Record<string, any> = {
    bsonType: 'object',
    required: ['jobId', 'customer', 'receivedDate', 'name', 'jobStatus'],
    properties: {
        jobId: {
            bsonType: 'number',
        },
        receivedDate: {
            bsonType: 'date',
        },
        customer: {
            bsonType: 'string',
        },
        name: {
            bsonType: 'string',
        },
        invoiceId: {
            bsonType: 'string',
        },
        jobStatus: {
            bsonType: 'object',
            properties: {
                generalStatus: {
                    bsonType: 'int',
                },
            },
        },
    },
};


@Injectable()
export class MaintenanceService {

    private logger = new Logger('Maintenance');

    constructor(
        private dbService: DatabaseService,
        @Inject(JOBS_COLLECTION) private jobsCollection: Collection<Job>,
        private config: ConfigService,
    ) { }

    async performTasks() {
        await this.createCollection();
        await this.createJobIndexes();
        await this.correctFolderPath(
            this.config.getOrThrow<string>('JOBS_INPUT').split(path.sep)
        );
        await this.upgradeDb();
    }

    private async createCollection(): Promise<void> {
        try {
            await this.dbService.db().createCollection(JOBS_COLLECTION_NAME, {
                validator: {
                    $jsonSchema: JOBS_SCHEMA,
                },
            });
        } catch (_) {
            return;
        }
    }

    private async upgradeDb(): Promise<void> {
        await this.jobsCollection.updateMany(
            {
                jobStatus: { $exists: false },
                invoiceId: { $exists: false },
            },
            {
                $set: { 'jobStatus.generalStatus': 20 },
            },
        );
        await this.jobsCollection.updateMany(
            {
                invoiceId: { $exists: true },
            },
            {
                $set: { 'jobStatus.generalStatus': 50 },
            },
        );
        await this.jobsCollection.updateMany(
            {
                products: {
                    $elemMatch: {
                        name: { $exists: true },
                        units: { $exists: false },
                    },
                },
            },
            {
                $set: { 'products.$[].units': DEFAULT_UNIT },
            },
        );
        await this.jobsCollection.updateMany(
            {
                $or: [{ _v: { $lt: 2 } }, { _v: { $exists: false } }],
                category: { $exists: true },
            },
            [
                {
                    $addFields: {
                        _v: 2,
                        'production.isLocked': '$isLocked',
                        'production.category': '$category',
                    },
                },
                {
                    $unset: ['isLocked', 'category'],
                },
            ],
        );
        await this.jobsCollection.updateMany(
            {
                _v: { $lt: 3 },
                'jobStatus.timestamp': { $exists: false },
            },
            [
                {
                    $set: {
                        'jobStatus.timestamp': '$dueDate',
                    },
                },
            ],
        );
        await this.jobsCollection.updateMany(
            {
                _v: { $lt: 3 },
            },
            {
                $set: {
                    _v: 3,
                },
            },
        );

        this.logger.log('db upgrade complete');

    }

    async createJobIndexes(): Promise<string[]> {
        const resp = await this.jobsCollection.createIndexes([
            {
                key: { jobId: 1 },
                unique: true,
            },
            {
                key: { customer: 1 },
            },
            {
                key: { receivedDate: -1 },
            },
            {
                key: { invoiceId: 1 },
            },
            {
                key: { 'jobStatus.generalStatus': 1 },
            },
            {
                key: { 'productionStages.productionStatus': 1 },
            },
            {
                key: { _v: 1 },
            },
            {
                key: { 'production.category': 1 },
            },
        ]);

        this.logger.log('Jobs collection indexes created');

        return resp;
    }

    private async correctFolderPath(base: string[]) {

        const filter: Record<string, string> = {};

        base.forEach((segm, idx) => filter[`files.path.${idx}`] = segm);

        const count = await this.jobsCollection.find(filter).count();

        this.logger.log(`Found incorrect pathnames in ${count} jobs`);

        const result = await this.jobsCollection.updateMany(
            filter,
            [
                {
                    $set: {
                        'files.path': {
                            $slice: [
                                '$files.path',
                                base.length,
                                { $size: '$files.path' }
                            ]
                        }
                    }
                }
            ]
        );
        this.logger.log(`Updated ${result.modifiedCount} records`);
    }


}