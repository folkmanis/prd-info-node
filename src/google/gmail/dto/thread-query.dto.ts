import { deserializeArray, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

const FORMAT = ['full', 'metadata', 'minimal'];

export class ThreadQuery {

    @Transform(({ value }) => typeof value === 'string' && value.split(','))
    @IsString({ each: true })
    @IsOptional()
    metadataHeaders?: string[];

    @IsIn(FORMAT)
    @IsOptional()
    format?: string;


}