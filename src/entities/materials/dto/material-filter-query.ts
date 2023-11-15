import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { pickNotNull } from '../../../lib/pick-not-null';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { Material } from '../entities/material.entity';

export class MaterialFilterQuery extends StartLimitFilter<Material> {
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : undefined,
  )
  @IsOptional()
  @IsString({ each: true })
  categories?: string[];

  toFilter(): FilterType<Material> {
    const { start, limit } = this;
    return {
      start,
      limit,
      filter: pickNotNull({
        name: this.name && { $regex: this.name, $options: 'gi' },
        category: this.categories?.length
          ? { $in: this.categories }
          : undefined,
      }),
    };
  }
}
