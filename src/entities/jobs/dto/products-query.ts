import { deserializeArray, Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, IsIn, ValidateNested } from 'class-validator';
import { endOfDay, startOfDay } from 'date-fns';
import { Filter } from 'mongodb';
import { pickNotNull } from '../../../lib/pick-not-null';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { JobProduct } from '../entities/job-product.entity';
import { Job } from '../entities/job.entity';

export class SortOrder {

    @IsIn(['name', 'category', 'units', 'sum', 'count', 'total'])
    column: string;

    @IsIn([-1, 1])
    direction: 1 | -1;

    constructor(value: string) {
        const [col, dir] = value.split(',');
        this.column = col;
        this.direction = +(dir ?? 1) as 1 | -1;
    }


}

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

    @Transform(({ value }) => new SortOrder(value))
    @IsOptional()
    @ValidateNested()
    sort?: SortOrder;


    toFilter(): FilterType<Job> {
        const { start, limit } = this;
        const filter: Filter<JobProduct> = {
            'jobStatus.generalStatus': this.jobStatus && { $in: this.jobStatus },
        };
        if (this.fromDate || this.toDate) {
            filter['jobStatus.timestamp'] = pickNotNull({
                $gte: this.fromDate,
                $lte: this.toDate,
            });
        }
        return {
            start,
            limit,
            filter: pickNotNull(filter) as Filter<Job>
        };
    }
}