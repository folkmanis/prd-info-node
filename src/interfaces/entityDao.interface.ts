import { UpdateWriteOpResult, DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';

export interface EntityDao<T extends { _id: any; }> {
    getArray<K extends keyof T>(filter: { [key in K]: T[K] }): Promise<Partial<T[]>>;
    getById(id: string): Promise<T | null>;
    addOne(obj: T): Promise<InsertOneWriteOpResult<T>>;
    updateOne(id: string, mat: Partial<T>): Promise<UpdateWriteOpResult>;
    deleteOneById(id: string): Promise<DeleteWriteOpResultObject>;
    validationData<K extends keyof T>(key: K): Promise<Array<T[K]>>;
}
