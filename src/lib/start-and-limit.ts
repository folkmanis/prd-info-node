import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class StartAndLimit {
    @Type(() => Number)
    @IsNumber()
    start: number = 0;

    @Type(() => Number)
    @IsNumber()
    limit: number = 100;

    @IsOptional()
    filter?: string;
}
