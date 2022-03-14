import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Filter } from 'mongodb';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { Customer } from '../entities/customer.entity';

export class CustomersQuery extends StartLimitFilter<Customer> {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  email?: string;

  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  disabled = false;

  toFilter() {
    const { start, limit } = this;
    const filter: Filter<any> = {};
    if (!this.disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    if (this.name) {
      filter.CustomerName = new RegExp(this.name, 'i');
    }
    if (this.email) {
      filter.email = this.email;
    }

    return {
      start,
      limit,
      filter,
    };
  }
}
