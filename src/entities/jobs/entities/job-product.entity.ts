import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';
import { IsMongoId, IsString, IsDate, IsInt, IsOptional, ValidateNested, IsNumber } from 'class-validator';

export class JobProduct {
    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    count: number;

    @IsString()
    @IsOptional()
    comment: string;

    @IsString()
    units: string;
};
