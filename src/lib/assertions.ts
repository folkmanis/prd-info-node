import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export function isPromise<T>(
  value: T | PromiseLike<T>,
): value is PromiseLike<T> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as any).then === 'function'
  );
}

export function assertCondition(
  condition: any,
  msg?: string,
): asserts condition {
  if (!condition) {
    throw new InternalServerErrorException(msg);
  }
}

export function assertNotNull<T>(
  value: T | null | undefined,
  msg?: string,
): asserts value is T {
  assertCondition(value !== null && value !== undefined, msg);
}

export function assertIsFound<T>(
  data: T | null | undefined,
  message: string = 'Not found',
): asserts data is T {
  if (data === null || data === undefined) {
    throw new NotFoundException(message);
  }
}

export function isFound<T>(
  data: T,
  message: string = 'Not found',
): T extends PromiseLike<infer U> ? Promise<NonNullable<U>> : NonNullable<T> {
  if (data === null || data === undefined) {
    throw new NotFoundException(message);
  }
  if (isPromise(data)) {
    return data.then((value) => isFound(value, message)) as any;
  } else {
    return data as any;
  }
}
