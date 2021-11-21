import { Invoice } from '../entities/invoice.entity';
import { PartialType, PickType, OmitType, IntersectionType } from '@nestjs/mapped-types';
import { IsString, IsNumber } from 'class-validator';

export class InvoiceInsert {

    @IsNumber(undefined, { each: true })
    jobIds: number[];

    @IsString()
    customerId: string;

}