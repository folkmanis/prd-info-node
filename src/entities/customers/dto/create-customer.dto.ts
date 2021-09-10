import { Customer } from '../entities/customer.entity';
import { OmitType, PartialType, IntersectionType } from '@nestjs/mapped-types';

export class CreateCustomerDto extends OmitType(Customer, ['_id']) { }
