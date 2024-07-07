import { IsOptional, IsString } from 'class-validator';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { Equipment } from '../entities/equipment.entity.js';

export class EquipmentFilterQuery extends StartLimitFilter<Equipment> {
  @IsString()
  @IsOptional()
  name?: string;

  toFilter() {
    const { start, limit } = this;
    return {
      start,
      limit,
      filter: pickNotNull({
        name: this.name && new RegExp(this.name, 'i'),
      }),
    };
  }
}
