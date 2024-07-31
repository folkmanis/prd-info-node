import { IsOptional, IsString } from 'class-validator';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { TransportationDriver } from '../entities/driver.entity.js';

export class DriverFilterQuery extends StartLimitFilter<TransportationDriver> {
  @IsString()
  @IsOptional()
  name?: string;

  toFilter(): FilterType<TransportationDriver> {
    const { start, limit } = this;
    return {
      start,
      limit,
      filter: pickNotNull({
        name: this.name && { $regex: this.name, $options: 'i' },
      }),
    };
  }
}
