import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { pickNotNull } from '../../../lib/pick-not-null';
import { ProductionStage } from '../entities/production-stage.entity';
import { IsString, IsOptional } from 'class-validator';

export class ProductionStageQueryFilter extends StartLimitFilter<ProductionStage> {
  @IsString()
  @IsOptional()
  name?: string;

  toFilter(): FilterType<ProductionStage> {
    const { limit, start } = this;
    return {
      limit,
      start,
      filter: pickNotNull({
        name: this.name && { $regex: this.name, $options: 'i' },
      }),
    };
  }
}
