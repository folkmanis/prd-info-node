import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Filter } from 'mongodb';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { Product } from '../entities/product.entity.js';

export class ProductQuery extends StartLimitFilter<Product> {
  @Transform(({ value }) => !!JSON.parse(value))
  @IsOptional()
  @IsBoolean()
  disabled = true;

  @Type(() => Number)
  @IsInt()
  start = 0;

  @Type(() => Number)
  @IsInt()
  limit = 100;

  @IsOptional()
  @IsString()
  name?: string;

  toFilter() {
    const { start, limit } = this;
    const filter: Filter<any> = {};
    if (!this.disabled) {
      filter.$or = [{ inactive: null }, { inactive: false }];
    }
    if (this.name) {
      filter.CustomerName = new RegExp(this.name, 'i');
    }

    return {
      start,
      limit,
      filter,
    };
  }
}

export class ProductFilter {
  @Exclude()
  _name: any;
  @Expose()
  set name(value: string) {
    this._name = value;
  }
  get name() {
    return this._name && { $regex: this._name, $options: 'i' };
  }
}
