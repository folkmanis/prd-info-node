import { ObjectId } from 'mongodb';

export interface ResponseBase<T = any> {
    // [key: string]: any,
    insertedId?: ObjectId | string | number;
    deletedCount?: number;
    modifiedCount?: number;
    insertedCount?: number;
    validatorData?: T[keyof T][];
    data?: T | Partial<T>[];
    error: any;
    result?: {
        ok?: number;
        n?: number;
    };
}