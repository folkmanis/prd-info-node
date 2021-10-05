import { FilterQuery } from 'mongodb';

export interface FilterType<T> {
    limit: number;
    start: number;
    filter: FilterQuery<T>;
};
