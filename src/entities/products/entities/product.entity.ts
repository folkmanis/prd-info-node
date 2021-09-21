import { ObjectId } from 'mongodb';
import { Type, Transform } from 'class-transformer';
import { IsNumber, IsString, IsMongoId, IsDate, IsBoolean, ValidateNested, IsOptional } from 'class-validator';
// import { ProductProductionStage } from '../interfaces';

export interface CustomerProduct {
    category: string;
    description: string;
    productName: string;
    customerName: string;
    price: number;
}

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
    description?: string;

    @Type(() => ProductPrice)
    @ValidateNested({ each: true })
    prices: ProductPrice[] = [];
    //   productionStages?: ProductProductionStage[];
}

// export type ProductNoId = Omit<Product, '_id'>;

// export type ProductNoPrices = Omit<ProductNoId, 'prices'>;

// export interface ProductPriceImport {
//   product: string;
//   customerName: string;
//   price: number;
// }
