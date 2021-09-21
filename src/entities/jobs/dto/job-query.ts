import { deserializeArray, Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { JobCategories, JOB_CATEGORIES } from '../entities/job-categories';

export interface JobQueryInterface {
    receivedDate?: Date;
    customer?: string;
    invoiceId?: Record<string, boolean>;
    name?: Record<string, string>;
    'jobStatus.generalStatus'?: Record<string, number[]>;
    category?: string;
    start: number;
    limit: number;
}

export class JobQuery {

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

    @Type(() => Number)
    @IsInt()
    start = 0;

    @Type(() => Number)
    @IsInt()
    limit = 100;
}

export class JobFilter {

    @Exclude({ toPlainOnly: true })
    fromDate?: Date;
    @Expose()
    get receivedDate() {
        return this.fromDate && { '$gte': this.fromDate };
    }

    customer?: string;

    @Exclude()
    _name: any;
    @Expose()
    set name(value: string) {
        this._name = value;
    }
    get name() {
        return this._name && { $regex: this._name, $options: 'i' };
    }

    @Exclude({ toPlainOnly: true })
    invoice?: 0 | 1;
    @Expose()
    get invoiceId() {
        return this.invoice !== undefined ? { $exists: !!this.invoice } : undefined;
    }

    @Exclude({ toPlainOnly: true })
    jobsId: number[];
    @Expose()
    get jobId() {
        return this.jobsId && { $in: this.jobsId };
    }

    @Exclude({ toPlainOnly: true })
    jobStatus?: number[];
    @Expose()
    get 'jobStatus.generalStatus'() {
        return this.jobStatus && { $in: this.jobStatus };
    }

    category?: JobCategories;

}

