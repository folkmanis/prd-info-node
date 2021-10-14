import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';

export class ProductProductionStageMaterial {

    @Type(() => ObjectId)
    @IsMongoId()
    materialId: ObjectId;

    @IsNumber()
    amount: number;

    @IsNumber()
    fixedAmount: number;
}

export class ProductProductionStage {

    @Type(() => ObjectId)
    @IsMongoId()
    productionStageId: ObjectId;

    @IsNumber()
    amount: number;

    @IsNumber()
    fixedAmount: number;

    @Type(() => ProductProductionStageMaterial)
    @ValidateNested({ each: true })
    materials: ProductProductionStageMaterial[];

}