import { pickBy } from 'lodash';


export function pickNotNull<T extends Record<string | number, any>>(obj: T): NonNullable<T> {
  return pickBy<T>(obj, val => val !== undefined && val !== null) as NonNullable<T>;
}
