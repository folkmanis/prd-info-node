import { ObjectId } from 'mongodb';

export interface ProductResult {
    [key: string]: any,
    product?: Product,
    products?: Product[],
    insertedId?: ObjectId,
    deletedCount?: number,
    modifiedCount?: number,
    error: any,
    result?: {
        ok: number,
        n: number,
    };
}

export type ProductCategories = 'plates';
export interface Product {
    _id: ObjectId,
    category: ProductCategories,
    name: string,
    description?: string,
    prices?: [
        [
            string, // customer
            number, // price
        ]
    ];
}

export type ProductNoId = Omit<Product, '_id'>;

export type ProductNoPrices = Omit<ProductNoId, 'prices'>;
