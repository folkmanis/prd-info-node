import { ObjectId } from 'mongodb';

export interface ResponseBase {
    [key: string]: any,
    insertedId?: ObjectId,
    deletedCount?: number,
    modifiedCount?: number,
    validatorData?: any[],
    data?: any | any[],
    error: any,
    result?: {
        ok: number,
        n: number,
    };
}