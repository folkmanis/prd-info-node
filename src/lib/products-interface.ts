import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export interface ProductResult extends ResponseBase {
    product?: Product,
    products?: Product[],
    prices?: any[],
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
