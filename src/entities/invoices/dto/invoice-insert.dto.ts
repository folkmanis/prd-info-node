import { Invoice } from '../entities/invoice.entity';
import { PartialType, PickType, OmitType, IntersectionType } from '@nestjs/mapped-types';
import { IsString, IsNumber } from 'class-validator';

export class InvoiceInsert {

    @IsNumber()
    jobIds: number[];

    @IsString()
    customerId: string;

}