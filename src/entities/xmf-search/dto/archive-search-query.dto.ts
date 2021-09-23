import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ArchiveSearchQuery {

    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsString({ each: true })
    customerName?: string[];

    @IsOptional()
    @IsNumber(undefined, { each: true })
    year?: number[];

    @IsOptional()
    @IsNumber(undefined, { each: true })
    month?: number[];

}
