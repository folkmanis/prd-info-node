import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { deserializeArray, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { JobOneProduct } from '../entities/job-one-product';
import { JobProduct } from '../entities/job-product.entity';
import { pickNotNull } from '../../../lib/pick-not-null';
import { startOfDay, endOfDay } from 'date-fns';
import { Filter } from 'mongodb';
import { Job } from '../entities/job.entity';

export class ProductsQuery extends StartLimitFilter<Job> {

    @Transform(({ value }) => startOfDay(new Date(value)))
    @IsOptional()
    @IsDate()
    fromDate?: Date;

    @Transform(({ value }) => endOfDay(new Date(value)))
    @IsOptional()
    @IsDate()
    toDate?: Date;

    @Transform(
        ({ value }) => deserializeArray(Number, `[${value}]`),
        { toClassOnly: true }
    )
    @IsOptional()
    @IsNumber(undefined, { each: true })
    jobStatus?: number[];

    @Transform(
        ({ value }) => value.split(','),
        { toClassOnly: true }
    )
    @IsOptional()
    @IsString({ each: true })
    category?: string[];


    toFilter(): FilterType<Job> {
        const { start, limit } = this;
        const filter: Filter<JobProduct> = {
            'jobStatus.generalStatus': this.jobStatus && { $in: this.jobStatus },
        };
        if (this.fromDate || this.toDate) {
            filter.dueDate = pickNotNull({
                $gte: this.fromDate,
                $lte: this.toDate,
            });
        }
        return {
            start,
            limit,
            filter: pickNotNull(filter)
        };
    }
}