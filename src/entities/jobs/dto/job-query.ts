import { deserializeArray, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { pickNotNull } from '../../../lib/pick-not-null';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { JobCategories, JOB_CATEGORIES } from '../entities/job-categories';
import { Job } from '../entities/job.entity';

export class JobQuery extends StartLimitFilter<Job> {

    @Type(() => Date)
    @IsOptional()
    @IsDate()
    fromDate?: Date;

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

    @Type(() => Boolean)
    @IsOptional()
    @IsBoolean()
    unwindProducts?: boolean;

    @Transform(
        ({ value }) => deserializeArray(Number, `[${value}]`),
        { toClassOnly: true }
    )
    @IsOptional()
    @IsNumber(undefined, { each: true })
    jobStatus?: number[];

    @Transform(
        ({ value }) => deserializeArray(Number, `[${value}]`),
        { toClassOnly: true }
    )
    @IsOptional()
    @IsNumber(undefined, { each: true })
    jobsId: number[];

    @IsOptional()
    @IsIn(JOB_CATEGORIES)
    category?: JobCategories;

    toFilter(): FilterType<Job> {
        const { start, limit } = this;

        return {
            start,
            limit,
            filter: pickNotNull({

                receivedDate: this.fromDate && { '$gte': this.fromDate },

                customer: this.customer,

                name: this.name && { $regex: this.name, $options: 'gi' },

                invoiceId: this.invoice !== undefined ? { $exists: !!this.invoice } : undefined,

                jobId: this.jobsId && { $in: this.jobsId },

                'jobStatus.generalStatus': this.jobStatus && { $in: this.jobStatus },

                'production.category': this.category,

            })
        };


    }
}
