import { Transform, Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';

export class ProductProductionStageMaterial {

    @Type(() => ObjectId)
    @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
    @IsObject()
    materialId: ObjectId;

    @IsNumber()
    amount: number;

    @IsNumber()
    fixedAmount: number;
}

export class ProductProductionStage {

    @Type(() => ObjectId)
    @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
    @IsObject()
    productionStageId: ObjectId;

    @IsNumber()
    amount: number;

    @IsNumber()
    fixedAmount: number;

    @Type(() => ProductProductionStageMaterial)
    @ValidateNested({ each: true })
    materials: ProductProductionStageMaterial[];

}