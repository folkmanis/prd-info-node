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
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? ObjectId.createFromHexString(value) : value,
    { toClassOnly: true },
  )
  @Transform(({ value }) => value.toString(), {
    toPlainOnly: true,
  })
  @IsObject()
  materialId: ObjectId;

  @IsNumber()
  amount: number;

  @IsNumber()
  fixedAmount: number;

  @IsNumber()
  cost: number;
}

export class JobProductionStage {
  @Type(() => ObjectId)
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? ObjectId.createFromHexString(value) : value,
    { toClassOnly: true },
  )
  @Transform(({ value }) => value.toString(), {
    toPlainOnly: true,
  })
  @IsObject()
  productionStageId: ObjectId;

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
