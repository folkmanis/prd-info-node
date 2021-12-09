import { ObjectId } from 'mongodb';
import { Type, Transform } from 'class-transformer';
import { Min, Max, IsMongoId, IsObject, IsString, IsDate, IsInt, IsOptional, ValidateNested, IsNumber, IsBoolean, IsIn } from 'class-validator';


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
}
