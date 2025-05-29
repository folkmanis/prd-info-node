import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Filter } from 'mongodb/mongodb.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { TransportationVehicle } from '../entities/vehicle.entity.js';

export class VehicleFilterQuery extends StartLimitFilter<TransportationVehicle> {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => !!JSON.parse(value))
  @IsBoolean()
  disabled = true;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : undefined,
  )
  @IsOptional()
  @IsString({ each: true })
  fuelTypes?: string[];

  toFilter(): FilterType<TransportationVehicle> {
    const { start, limit } = this;
    const filter: Filter<any> = {};
    if (this.name) {
      filter.name = new RegExp(this.name, 'i');
    }
    if (this.fuelTypes?.length) {
      filter['fuelType.type'] = { $in: this.fuelTypes };
    }
    if (!this.disabled) {
      filter['$or'] = [{ disabled: null }, { disabled: false }];
    }

    return {
      start,
      limit,
      filter,
    };
  }
}
