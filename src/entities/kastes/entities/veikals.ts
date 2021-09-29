import { ObjectId } from 'mongodb';
import { Kaste } from './kaste.entity';
import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';

export class Veikals {
    @Type(() => ObjectId)
    @IsMongoId()
    _id: ObjectId;

    @Type(() => Number)
    @IsNumber()
    kods: number;

    @IsString()
    adrese: string;

    @Type(() => Number)
    @IsNumber()
    pasutijums: number;

    @Type(() => Kaste)
    @ValidateNested({ each: true })
    kastes: Kaste[];

    @Type(() => Date)
    @IsDate()
    lastModified = new Date();

    @IsNumber()
    @IsOptional()
    kaste?: number;
}
