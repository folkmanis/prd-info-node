import { FactoryProvider } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DatabaseService } from '../../../database';

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

export const JOBS_COLLECTION = 'JOBS_COLLECTION';

export const jobsCollectionProvider: FactoryProvider = {
    provide: JOBS_COLLECTION,
    useFactory: async (dbService: DatabaseService) => {

        const db = dbService.db();
        await createCollection(db);

        const collection = db.collection(JOBS_COLLECTION_NAME);
        await upgradeDb(collection);
        createIndexes(collection);

        return collection;
    },
    inject: [DatabaseService],
};


async function createCollection(db: Db): Promise<void> {
    try {
        await db.createCollection(JOBS_COLLECTION_NAME, {
            validator: {
                $jsonSchema: JOBS_SCHEMA,
            },
        });
    } catch (_) {
        return;
    }
}

async function upgradeDb(collection: Collection): Promise<void> {
    await collection.updateMany(
        {
            jobStatus: { $exists: false },
            invoiceId: { $exists: false },
        },
        {
            $set: { 'jobStatus.generalStatus': 20, },
        },
    );
    await collection.updateMany(
        {
            invoiceId: { $exists: true },
        },
        {
            $set: { 'jobStatus.generalStatus': 50, },
        },
    );
    await collection.updateMany(
        {
            products: {
                $elemMatch: {
                    name: { $exists: true },
                    units: { $exists: false },
                },
            },
        },
        {
            $set: { 'products.$[].units': DEFAULT_UNIT, },
        },
    );
    await collection.updateMany(
        {
            $or: [
                { _v: { $lt: 2 } },
                { _v: { $exists: false } }
            ]
        },
        [{
            $addFields: {
                _v: 2,
                "production.isLocked": "$isLocked",
                "production.category": "$category"
            }
        }, {
            $unset:
                ["isLocked", "category"]
        }]
    );
    await collection.updateMany(
        {
            _v: { $lt: 3 },
            'jobStatus.timestamp': { $exists: false },
        },
        [
            {
                $set: {
                    'jobStatus.timestamp': '$dueDate',
                }
            }
        ],
    );
    await collection.updateMany(
        {
            _v: { $lt: 3 }
        },
        {
            $set: {
                _v: 3,
            }
        }
    );
};


function createIndexes(collection: Collection): void {
    collection.createIndexes([
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
            key: { 'production.category': 1 }
        }
    ]);
};

