import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { FilterQuery } from 'mongodb';
import { StartLimitFilter } from '../../../lib/start-limit-filter/start-limit-filter.class';
import { Customer } from '../entities/customer.entity';

export class CustomersQuery extends StartLimitFilter<Customer> {

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