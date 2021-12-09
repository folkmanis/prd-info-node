import { ObjectId } from 'mongodb';
import { Transform, Type } from 'class-transformer';
import { IsMongoId, IsString, IsOptional, IsObject } from 'class-validator';

export class Equipment {

    @Type(() => ObjectId)
    @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
    @IsObject()
    _id: ObjectId;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
