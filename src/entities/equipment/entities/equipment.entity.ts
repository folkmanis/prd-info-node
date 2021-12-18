import { Transform, Type } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

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
