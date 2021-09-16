import { JobCategories, JOB_CATEGORIES } from '../entities/job-categories';
import { MongoClient, Collection, ObjectId, FilterQuery, UpdateQuery, BulkWriteUpdateOneOperation, BulkWriteUpdateOperation, Db, } from 'mongodb';
import { isDate, isString, isNumber, ValidateNested, IsIn, IsDate, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { pickBy } from 'lodash';
import { Job } from '../entities/job.entity';

export class JobQuery {

    @Type(() => Date)
    @IsDate()
    fromDate?: Date;

    @IsString()
    customer?: string;

    @IsString()
    name?: string;

    @Type(() => Boolean)
    @IsBoolean()
    invoice?: boolean;

    @Type(() => Number)
    jobsId: number[] = [];

    @Type(() => Boolean)
    @IsBoolean()
    unwindProducts?: boolean;

    @IsString()
    jobStatus?: string;

    @IsIn(JOB_CATEGORIES)
    category?: JobCategories;
}

export class JobFilter implements FilterQuery<Job> {

    receivedDate?;
    customer?;
    invoiceId?;
    name?;
    jobId;
    'jobStatus.generalStatus'?: undefined | Record<string, string>;
    category?;

    constructor(query: JobQuery) {
        this.receivedDate = query.fromDate && { $gte: query.fromDate };
        this.customer = query.customer;
        this.invoiceId = typeof query.invoice !== 'boolean' ? { $exists: query.invoice } : undefined;
        this.name = query.name?.length ? { $regex: query.name, $options: 'i' } : undefined;
        this.jobId = query.jobsId.length > 0 ? { $in: query.jobsId } : undefined;
        this['jobStatus.generalStatus'] = query.jobStatus?.length ? {
            $in: query.jobStatus
        } : undefined;
        this.category = query.category;
    }

}