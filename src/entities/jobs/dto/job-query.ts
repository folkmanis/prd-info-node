import { JobCategories, JOB_CATEGORIES } from '../entities/job-categories';
import { MongoClient, Collection, ObjectId, FilterQuery, UpdateQuery, BulkWriteUpdateOneOperation, BulkWriteUpdateOperation, Db, } from 'mongodb';
import { isDate, isString, isNumber, ValidateNested, IsIn, IsDate, IsString, IsBoolean, IsOptional, IsNumber, IsInt } from 'class-validator';
import { Exclude, Type, deserializeArray, Transform, classToPlain, Expose } from 'class-transformer';
import { pickBy } from 'lodash';
import { Job } from '../entities/job.entity';

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

// @Exclude()
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
    jobStatus?: number[];
    @Expose()
    get 'jobStatus.generalStatus'() {
        return this.jobStatus && { $in: this.jobStatus };
    }

    category?: JobCategories;

}

