import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export interface ProductResult extends ResponseBase<Product> {
    customerProducts?: CustomerProduct[];
    prices?: any[],
}

export interface CustomerProduct {
    category: string;
    description: string;
    productName: string;
    customerName: string;
    price: number;
}

export interface Product {
    _id: ObjectId,
    category: string,
    name: string,
    description?: string,
    prices: [
        {
            customerName: string,
            price: number,
        }
    ];
}

export type ProductNoId = Omit<Product, '_id'>;

export type ProductNoPrices = Omit<ProductNoId, 'prices'>;
