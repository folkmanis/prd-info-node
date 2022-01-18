import { pickBy } from 'lodash';

type NonNullType<
  T extends Record<string | number, any>,
  K extends keyof T = keyof T,
> = { [key in NonNullable<K>]: T[key] };

export function pickNotNull<T extends Record<string | number, any>>(
  obj: T,
): NonNullType<T> {
  return pickBy(
    obj,
    (val) => val !== undefined && val !== null,
  ) as NonNullType<T>;
}
