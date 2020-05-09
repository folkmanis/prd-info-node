import { ObjectId } from 'mongodb';

export interface ResponseBase<T = any> {
    // [key: string]: any,
    insertedId?: ObjectId | number,
    deletedCount?: number,
    modifiedCount?: number,
    validatorData?: T[keyof T][],
    data?: T | Partial<T>[],
    error: any,
    result?: {
        ok: number,
        n: number,
    };
}