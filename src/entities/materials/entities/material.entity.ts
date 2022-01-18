import { ObjectId } from 'mongodb';
import { Transform, Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  IsOptional,
  IsObject,
} from 'class-validator';

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
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
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
