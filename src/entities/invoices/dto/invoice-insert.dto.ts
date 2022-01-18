import { IsString, IsNumber } from 'class-validator';

export class InvoiceInsert {
  @IsNumber(undefined, { each: true })
  jobIds: number[];

  @IsString()
  customerId: string;
}
