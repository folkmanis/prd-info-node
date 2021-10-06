import { ObjectId } from 'mongodb';
import { IsMongoId, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductionStage {

    @Type(() => ObjectId)
    @IsMongoId()
    _id: ObjectId;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @Type(() => ObjectId)
    @IsMongoId({ each: true })
    equipmentIds: ObjectId[];

    @Type(() => ObjectId)
    @IsMongoId()
    @IsOptional()
    defaultEquipmentId?: ObjectId;

}
