import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { StartLimitFilter } from '../../lib/start-limit-filter/start-limit-filter.class';
import { FilterType } from '../../lib/start-limit-filter/filter-type.interface';
import { LogRecord } from './log-record.interface';
import { pickNotNull } from '../../lib/pick-not-null';

export class LogQuery extends StartLimitFilter<LogRecord> {

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    level: number;

    @Type(() => Date)
    @IsDate()
    dateTo: Date = new Date();

    @Type(() => Date)
    @IsDate()
    dateFrom: Date = new Date(0);

    toFilter(): FilterType<LogRecord> {
        const { start, limit } = this;
        return {
            start,
            limit,
            filter: pickNotNull({
                $and: [
                    { timestamp: { $lte: this.dateTo } },
                    { timestamp: { $gte: this.dateFrom } },
                ],
                level: this.level && { $lte: this.level },

            })
        };
    }
}
