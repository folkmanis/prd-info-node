import { ObjectId, FilterQuery } from 'mongodb';

export interface FilterType<T> {
    limit: number;
    start: number;
    filter: FilterQuery<T>;
};

export interface EntityDao<T extends { _id: ObjectId; }> {
    findAll(filter: FilterType<T>): Promise<Partial<T>[]>;
    getOneById(id: ObjectId): Promise<T | null>;
    insertOne(obj: Omit<T, '_id'>): Promise<T | null | undefined>;
    updateOne(id: ObjectId, mat: Partial<T>): Promise<T | undefined>;
    deleteOneById(id: ObjectId): Promise<number>;
    validationData<K extends keyof T>(key: K): Promise<Array<T[K]>>;
}
