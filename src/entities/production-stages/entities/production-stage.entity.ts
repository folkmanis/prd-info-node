import { ObjectId } from 'mongodb';
import { IsMongoId, IsString, IsOptional, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProductionStage {

    @Type(() => ObjectId)
    @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
    @IsObject()
    _id: ObjectId;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @Type(() => ObjectId)
    @Transform(({ value }) => [...value].map(id => new ObjectId(id)), { toClassOnly: true })
    @IsObject({ each: true })
    equipmentIds: ObjectId[];

    @Type(() => ObjectId)
    @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
    @IsObject()
    @IsOptional()
    defaultEquipmentId?: ObjectId;

}
