import { ObjectId } from 'mongodb';
import { IntersectionType } from '@nestjs/mapped-types';
import { JOB_CATEGORIES, JobCategories, ReproProduction, KastesProduction, ProductionCategory, PrintProduction } from './job-categories';
import { Transform, Type } from 'class-transformer';
import { Min, Max, IsMongoId, IsString, IsDate, IsInt, IsOptional, ValidateNested, IsNumber, IsBoolean, IsIn, IsObject } from 'class-validator';
import { JobProduct } from './job-product.entity';
import { JobProductionStage } from './job-production-stage.entity';


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
    @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
    @IsObject()
    _id: ObjectId;

    @Min(2)
    @Max(2)
    _v = 2;

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
    products: JobProduct[];

    @Type(() => JobStatus)
    @ValidateNested()
    jobStatus: JobStatus;

    @Type(() => Files)
    @ValidateNested()
    @IsOptional()
    files?: Files;

    @Type(() => JobProductionStage)
    @ValidateNested()
    @IsOptional()
    productionStages?: JobProductionStage[];

    @Type(() => ProductionCategory, {
        discriminator: {
            property: 'category',
            subTypes: [
                { value: ReproProduction, name: 'repro' },
                { value: KastesProduction, name: 'perforated paper' },
                { value: PrintProduction, name: 'print' },
            ]
        },
        keepDiscriminatorProperty: true,
    })
    @IsOptional()
    production: ReproProduction | KastesProduction | PrintProduction;

}

export class KastesJob extends Job {
    production: KastesProduction;
}

export class ReproJob extends Job {
    production: ReproProduction;
}

export class PrintJob extends Job {
    production: PrintProduction;
}
