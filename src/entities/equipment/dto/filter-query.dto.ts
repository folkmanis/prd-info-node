import { StartAndLimit } from '../../../lib/query-start-limit.pipe';
import { IsString, IsOptional } from 'class-validator';
import { Exclude, Expose, classToPlain } from 'class-transformer';
import { pickNotNull } from '../../../lib/pick-not-null';

export class EquiomentFilterQuery extends StartAndLimit {

    @IsString()
    @IsOptional()
    name?: string;

    toFilter() {
        const { start, limit } = this;
        return {
            start,
            limit,
            filter: pickNotNull(
                {
                    name: this.name && new RegExp(this.name, 'gi')
                }
            )
        };
    }

}