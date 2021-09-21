import { Module, FactoryProvider } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DatabaseService } from '../../../database';

export const PRODUCTS_COLLECTION = 'PRODUCTS_COLLECTION';

const PRODUCTS_COLLECTION_NAME = 'products';
const DEFAULT_UNIT = 'gab.';

export const ProductsCollectionProvider: FactoryProvider = {
    provide: PRODUCTS_COLLECTION,
    useFactory: async (dbService: DatabaseService) => {
        try {
            const db = dbService.db();
            const collection = db.collection(PRODUCTS_COLLECTION_NAME);
            await updateDb(collection);
            createIndexes(collection);

            return collection;

        } catch (error) {
            console.error(`Database error`, error);
            process.exit(1);
        }
    },
    inject: [DatabaseService],
};

async function updateDb(collection: Collection) {
    collection.updateMany(
        { units: { $exists: false } },
        { $set: { units: DEFAULT_UNIT } },
    );
}

function createIndexes(collection: Collection) {
    return collection.createIndexes([
        {
            key: { category: 1 },
        },
        {
            key: { name: 1 },
            unique: true,
        },
        {
            key: {
                _id: 1,
                'prices.0': 1,
            },
            name: 'prices',
            unique: true,
        },
    ]);
}
