import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';
import { ValidateNested, IsMongoId, IsString, IsBoolean, IsNumber, Min, IsOptional } from 'class-validator';

export class MaterialPrices {

    @IsNumber()
    @Min(0)
    min: number;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    description: string;
}

export class Material {

    @Type(() => ObjectId)
    @IsMongoId()
    _id: ObjectId;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    units: string;

    @IsString()
    category: string;

    @IsBoolean()
    inactive: boolean;

    @IsNumber()
    fixedPrice: number;

    @Type(() => MaterialPrices)
    @ValidateNested({ each: true })
    prices: MaterialPrices[];
}


{
}