import { ObjectId } from 'mongodb';
import { IntersectionType } from '@nestjs/mapped-types';
import { JOB_CATEGORIES, JobCategories, ReproProduction, KastesProduction, ProductionCategory } from './job-categories';
import { Type } from 'class-transformer';
import { IsMongoId, IsString, IsDate, IsInt, IsOptional, ValidateNested, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { JobProduct } from './job-product.entity';


export class JobStatus {
    @IsNumber()
    generalStatus: number;
}

export class Files {
    @IsString({ each: true })
    path: string[];

    @IsString({ each: true })
    @IsOptional()
    fileNames?: string[];
}

export class Job {
    @Type(() => ObjectId)
    @IsMongoId()
    _id: ObjectId;

    @IsIn(JOB_CATEGORIES)
    category: JobCategories;

    @IsNumber()
    jobId: number;

    @IsString()
    customer: string;

    @IsString()
    name: string;

    @IsString()
    customerJobId?: string;

    @Type(() => Date)
    @IsDate()
    receivedDate: Date;

    @Type(() => Date)
    @IsDate()
    dueDate: Date;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsString()
    @IsOptional()
    invoiceId?: string;

    @Type(() => JobProduct)
    @ValidateNested({ each: true })
    @IsOptional()
    products?: JobProduct[];

    @Type(() => JobStatus)
    @ValidateNested()
    jobStatus: JobStatus;

    @Type(() => Files)
    @ValidateNested()
    @IsOptional()
    files?: Files;

    @Type(() => ProductionCategory, {
        discriminator: {
            property: 'category',
            subTypes: [
                { value: ReproProduction, name: 'repro' },
                { value: KastesProduction, name: 'perforated paper' },
            ]
        },
        keepDiscriminatorProperty: true,
    })
    @IsOptional()
    production?: ReproProduction | KastesProduction;


}

export class KastesJob extends Job {
    production: KastesProduction;
}

export class ReproJob extends Job {
    production: ReproProduction;
}