import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class JobProductionStageMaterial {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  materialId: ObjectId;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  fixedAmount: number;
}

export class JobProductionStage {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  productionStageId: ObjectId;

  @IsString()
  @IsOptional()
  name?: string;

  @Type(() => JobProductionStageMaterial)
  @ValidateNested({ each: true })
  materials: JobProductionStageMaterial[];

  @IsNumber()
  amount: number;

  @IsNumber()
  fixedAmount: number;

  @IsNumber()
  @IsOptional()
  productionStatus?: number;

  @IsString({ each: true })
  @IsOptional()
  dropFolder?: string[];
}
