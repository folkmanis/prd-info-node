import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';
import { Min, Max, IsMongoId, IsString, IsDate, IsInt, IsOptional, ValidateNested, IsNumber, IsBoolean, IsIn } from 'class-validator';


export class JobProductionStageMaterial {

    @Type(() => ObjectId)
    @IsMongoId()
    materialId: string;

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
    @IsMongoId()
    productionStageId: string;

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
