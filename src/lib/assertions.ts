import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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
