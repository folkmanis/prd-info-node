import { Transform, Type } from 'class-transformer';
import {
  Equals,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import {
  KastesProduction,
  PrintProduction,
  ProductionCategory,
  ReproProduction,
} from './job-categories.js';
import { JobProduct } from './job-product.entity.js';
import { JobProductionStage } from './job-production-stage.entity.js';

export const CURRENT_VERSION = 4;

export class JobStatus {
  @IsNumber()
  generalStatus: number;

  @Type(() => Date)
  @IsDate()
  timestamp: Date;
}

export class Files {
  @IsString({ each: true })
  path: string[];

  @IsString({ each: true })
  @IsOptional()
  fileNames?: string[];
}

export class Job {
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  _id: ObjectId;

  @Equals(CURRENT_VERSION)
  _v: number = CURRENT_VERSION;

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
      ],
    },
    keepDiscriminatorProperty: true,
  })
  // @IsOptional()
  @ValidateNested()
  production: ReproProduction | KastesProduction | PrintProduction;
}

export class KastesJob extends Job {
  declare production: KastesProduction;
}

export class ReproJob extends Job {
  declare production: ReproProduction;
}

export class PrintJob extends Job {
  declare production: PrintProduction;
}
