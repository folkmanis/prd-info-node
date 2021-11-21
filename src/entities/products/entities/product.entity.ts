import { ObjectId } from 'mongodb';
import { Type, Transform } from 'class-transformer';
import { IsNumber, IsString, IsMongoId, IsDate, IsBoolean, ValidateNested, IsOptional } from 'class-validator';
import { ProductProductionStage } from './production-stage';

export class ProductPrice {

    @IsString()
    customerName: string;

    @IsNumber()
    price: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    lastUsed?: Date;
}

export class Product {

    @IsMongoId()
    _id: ObjectId;

    @IsString()
    name: string;

    @IsBoolean()
    inactive: boolean;

    @IsString()
    category: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    units: string;

    @Type(() => ProductPrice)
    @ValidateNested({ each: true })
    prices: ProductPrice[];

    @Type(() => ProductProductionStage)
    @ValidateNested({ each: true })
    productionStages?: ProductProductionStage[];

    @IsNumber()
    @IsOptional()
    paytraqId?: number;

}
