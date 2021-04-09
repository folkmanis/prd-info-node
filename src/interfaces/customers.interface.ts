import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export interface Customer {
    _id: ObjectId,
    code: string,
    CustomerName: string,
    disabled?: boolean,
    description?: string,
    insertedFromXmf?: Date,
    financial?: {
        clientName: string;
    };
}

export interface CustomerResult extends ResponseBase<Customer> {
}

