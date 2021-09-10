import { PartialType, PickType } from '@nestjs/mapped-types';
import { Customer } from '../entities/customer.entity';

export class ListCustomer
    extends PickType(Customer, ['_id', 'CustomerName', 'code', 'disabled']) { }