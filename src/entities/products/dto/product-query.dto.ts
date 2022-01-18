import { Exclude, Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProductQuery {
  @Type(() => Number)
  @IsInt()
  start = 0;

  @Type(() => Number)
  @IsInt()
  limit = 100;

  @IsOptional()
  @IsString()
  name?: string;
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
