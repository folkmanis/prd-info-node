import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { TransportationVehicle } from '../entities/vehicle.entity.js';

export class VehicleFilterQuery extends StartLimitFilter<TransportationVehicle> {
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : undefined,
  )
  @IsOptional()
  @IsString({ each: true })
  fuelTypes?: string[];

  toFilter(): FilterType<TransportationVehicle> {
    const { start, limit } = this;
    return {
      start,
      limit,
      filter: pickNotNull({
        name: this.name && { $regex: this.name, $options: 'i' },
        'fuelType.type': this.fuelTypes?.length
          ? { $in: this.fuelTypes }
          : undefined,
      }),
    };
  }
}
