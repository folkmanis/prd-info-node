import { ObjectId } from 'mongodb';
import { Product } from './products.interface';

export type JobCategories = 'repro' | 'perforated paper';

export type JobProduct = Pick<Product, 'name'> & {
    price: number;
    count: number;
    comment: string;
    units: string;
};

export interface JobBase {
    _id?: ObjectId;
    jobId: number;
    customer: string;
    name: string;
    customerJobId?: string;
    receivedDate: Date;
    dueDate: Date;
    comment?: string,
    invoiceId?: string;
    products?: JobProduct[] | JobProduct;
    productsIdx?: number;
    jobStatus: {
        generalStatus: number;
    };
    custCode?: string;
    files?: {
        path: string[];
        fileNames?: string[];
    };
}

