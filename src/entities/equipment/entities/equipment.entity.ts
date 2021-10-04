import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';
import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class Equipment {

    @Type(() => ObjectId)
    @IsMongoId()
    _id: ObjectId;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
