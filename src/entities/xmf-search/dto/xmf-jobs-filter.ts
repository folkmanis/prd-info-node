import { intersection } from 'lodash';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class XmfJobsFilter {

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

    @IsString({ each: true })
    customers: string[];

    toFilter(): Record<string, any> {
        const filter: Record<string, any> = {};
        const { customerName, q, year, month } = this;
        const customers = customerName ? intersection(customerName, this.customers) : this.customers;
        filter.CustomerName = {
            $in: customers,
        };
        if (q) {
            filter['$or'] = [
                { JDFJobID: q },
                { DescriptiveName: { $regex: q, $options: 'i' } },
            ];
        }
        if (year) {
            filter['Archives.yearIndex'] = { $in: year };
        }
        if (month) {
            filter['Archives.monthIndex'] = { $in: month };
        }
        return filter;
    }

}