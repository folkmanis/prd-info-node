import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';

export class RouteSheetFilterQuery extends StartLimitFilter<TransportationRouteSheet> {
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : undefined,
  )
  @IsOptional()
  @IsString({ each: true })
  fuelTypes?: string[];

  @Transform(({ value }) => (!isNaN(Number(value)) ? Number(value) : undefined))
  @IsOptional()
  @IsNumber()
  year?: number;

  @Transform(({ value }) => (!isNaN(Number(value)) ? Number(value) : undefined))
  @IsOptional()
  @IsNumber()
  month?: number;

  toFilter(): FilterType<TransportationRouteSheet> {
    const { start, limit } = this;
    return {
      start,
      limit,
      filter: pickNotNull({
        name: this.name && { $regex: this.name, $options: 'i' },
        'vehicle.fuelType.type': this.fuelTypes?.length
          ? { $in: this.fuelTypes }
          : undefined,
        year: this.year ? { $eq: this.year } : undefined,
        month: this.month ? { $eq: this.month } : undefined,
      }),
    };
  }
}
