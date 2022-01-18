import { Material } from '../entities/material.entity';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { IsString, IsOptional } from 'class-validator';
import { deserializeArray, Transform } from 'class-transformer';
import { pickNotNull } from '../../../lib/pick-not-null';

export class MaterialFilterQuery extends StartLimitFilter<Material> {
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({ value }) => deserializeArray(String, `[${value}]`))
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
