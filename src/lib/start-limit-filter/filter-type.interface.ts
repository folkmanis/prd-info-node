import { Filter } from 'mongodb';

export interface FilterType<T> {
    limit: number;
    start: number;
    filter: Filter<T>;
};
