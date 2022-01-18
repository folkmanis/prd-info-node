import { ObjectId } from 'mongodb';
import { FilterType } from '../lib/start-limit-filter/filter-type.interface';

export interface EntityDao<T extends { _id: ObjectId }> {
  findAll(filter: FilterType<T>): Promise<Partial<T>[]>;
  getOneById(id: ObjectId): Promise<T | null>;
  insertOne(obj: Omit<T, '_id'>): Promise<T | null | undefined>;
  updateOne(id: ObjectId, mat: Partial<T>): Promise<T | null>;
  deleteOneById(id: ObjectId): Promise<number>;
  validationData<K extends keyof T>(key: K): Promise<Array<T[K]>>;
}
