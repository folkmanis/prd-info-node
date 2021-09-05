import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';
import { ProductProductionStage } from '../interfaces';

export interface ProductResult extends ResponseBase<Product> {
  customerProducts?: CustomerProduct[];
  prices?: any[];
}

export interface CustomerProduct {
  category: string;
  description: string;
  productName: string;
  customerName: string;
  price: number;
}

export interface Product {
  _id: ObjectId;
  inactive: boolean;
  category: string;
  name: string;
  description?: string;
  prices?: [
    {
      customerName: string;
      price: number;
      lastUsed?: Date;
    },
  ];
  productionStages?: ProductProductionStage[];
}

export type ProductNoId = Omit<Product, '_id'>;

export type ProductNoPrices = Omit<ProductNoId, 'prices'>;

export interface ProductPriceImport {
  product: string;
  customerName: string;
  price: number;
}
