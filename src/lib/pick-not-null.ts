import { Dictionary, pickBy } from 'lodash';

export function pickNotNull<T>(obj: Dictionary<T>): Dictionary<T> {
    return pickBy(obj, val => val !== undefined && val !== null);
}