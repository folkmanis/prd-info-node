import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Filter } from 'mongodb';
import { pickNotNull } from '../../../lib/pick-not-null.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class.js';
import { JOB_CATEGORIES, JobCategories } from '../entities/job-categories.js';
import { Job } from '../entities/job.entity.js';

export class JobQuery extends StartLimitFilter<Job> {
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  toDate?: Date;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @Type(() => Number)
  @IsOptional()
  @IsIn([0, 1])
  invoice?: 0 | 1;

  @Transform(({ value }) => !!JSON.parse(value))
  @IsOptional()
  @IsBoolean()
  unwindProducts?: boolean;

  @Transform(({ value }) => JSON.parse(`[${value}]`), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsArray()
  @IsNumber(undefined, { each: true })
  jobStatus?: number[];

  @Transform(({ value }) => JSON.parse(`[${value}]`), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsArray()
  @IsNumber(undefined, { each: true })
  jobsId: number[];

  @IsOptional()
  @IsIn(JOB_CATEGORIES)
  category?: JobCategories;

  @IsOptional()
  productsName?: string[];

  toFilter(): FilterType<Job> {
    const { start, limit } = this;

    const filter: Filter<Job> = pickNotNull({
      customer: this.customer || undefined,

      name: this.name && { $regex: this.name, $options: 'i' },

      invoiceId:
        this.invoice !== undefined ? { $exists: !!this.invoice } : undefined,

      jobId: this.jobsId && { $in: this.jobsId },

      'jobStatus.generalStatus': this.jobStatus && { $in: this.jobStatus },

      'production.category': this.category,

      'products.name': this.productsName,
    });

    if (this.fromDate || this.toDate) {
      filter.receivedDate = pickNotNull({
        $gte: this.fromDate,
        $lte: this.toDate,
      });
    }

    return {
      start,
      limit,
      filter,
    };
  }
}
