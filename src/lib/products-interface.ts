import { ObjectId } from 'mongodb';

export interface ProductResult {
    [key: string]: any,
    product?: Product,
    products?: Product[],
    insertedId?: ObjectId,
    deletedCount?: number,
    modifiedCount?: number,
    error: any,
    prices?: any[],
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
    prices: [
        {
            name: string,
            price: number,
        }
    ];
}

export type ProductNoId = Omit<Product, '_id'>;

export type ProductNoPrices = Omit<ProductNoId, 'prices'>;
