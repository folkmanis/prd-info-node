import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { FilterType } from './filter-type.interface.js';

export class StartLimit {
  @Type(() => Number)
  @IsNumber()
  start = 0;

  @Type(() => Number)
  @IsNumber()
  limit = 100;
}

export abstract class StartLimitFilter<T> extends StartLimit {
  abstract toFilter(): FilterType<T>;
}
