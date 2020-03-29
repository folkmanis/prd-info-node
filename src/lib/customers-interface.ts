import { ObjectId } from 'mongodb';

export interface Customer {
    _id: ObjectId,
    code: string,
    CustomerName: string,
    disabled: boolean,
}