import { FilterQuery } from 'mongodb';
import { pickNotNull } from '../../../lib/pick-not-null';
import { StartAndLimit } from '../../../lib/query-start-limit.pipe';
import { classToPlain, Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Customer } from '../entities/customer.entity';

export class CustomersQuery extends StartAndLimit {

    @IsString()
    @IsOptional()
    name: string;

    @Transform(({ value }) => value === 'true' ? true : false)
    @IsBoolean()
    disabled = false;

    toFilter() {
        const { start, limit } = this;
        const filter: FilterQuery<Customer> = {};
        if (!this.disabled) {
            filter.$or = [
                { disabled: { $exists: false } },
                { disabled: false }
            ];
        }
        if (this.name) {
            filter.CustomerName = new RegExp(this.name, 'i');
        }

        return {
            start,
            limit,
            filter,
        };
    }

}