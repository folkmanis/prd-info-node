import { Job } from '../entities/job.entity.js';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { endOfDay, startOfDay } from 'date-fns';
import { Filter } from 'mongodb';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';

export class JobMaterialsSummaryQuery extends StartLimitFilter<Job> {
  @Transform(({ value }) => startOfDay(new Date(value)))
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @Transform(({ value }) => endOfDay(new Date(value)))
  @IsOptional()
  @IsDate()
  toDate?: Date;

  @Transform(({ value }) => value.split(','), { toClassOnly: true })
  @IsOptional()
  @IsString({ each: true })
  customers?: string[];

  @Transform(({ value }) => JSON.parse(`[${value}]`), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsNumber(undefined, { each: true })
  jobStatus?: number[];

  toFilter(): FilterType<Job> {
    const { start, limit } = this;
    const filter: Filter<Job> = {
      'jobStatus.generalStatus': this.jobStatus && { $in: this.jobStatus },
    };
    if (this.fromDate || this.toDate) {
      filter['receivedDate'] = pickNotNull({
        $gte: this.fromDate,
        $lte: this.toDate,
      });
    }
    if (Array.isArray(this.customers) && this.customers.length > 0) {
      filter['customer'] = { $in: this.customers };
    }
    return {
      start,
      limit,
      filter: pickNotNull(filter) as Filter<Job>,
    };
  }
}
