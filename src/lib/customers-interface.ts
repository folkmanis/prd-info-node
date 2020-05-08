import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export interface Customer {
    _id: ObjectId,
    code?: string,
    CustomerName: string,
    disabled?: boolean,
}


export interface CustomerResult extends ResponseBase {
    data?: Customer | Partial<Customer>[],
}

export interface Result {
    "n"?: number,
    "ok"?: number,
}
