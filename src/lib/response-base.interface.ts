import { ObjectId } from 'mongodb';

export interface ResponseBase {
    [key: string]: any,
    insertedId?: ObjectId,
    deletedCount?: number,
    modifiedCount?: number,
    error: any,
    result?: {
        ok: number,
        n: number,
    };
}