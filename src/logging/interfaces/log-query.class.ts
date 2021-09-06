import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class LogQuery {

    @Type(() => Number)
    @IsNumber()
    limit: number = 500;

    @Type(() => Number)
    @IsNumber()
    start: number = 0;

    @Type(() => Number)
    @IsNumber()
    level: number = 100;

    @Type(() => Date)
    @IsDate()
    dateTo: Date = new Date();

    @Type(() => Date)
    @IsDate()
    dateFrom: Date = new Date(0);
}
