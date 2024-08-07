import { PickType } from '@nestjs/mapped-types';
import { Customer } from '../entities/customer.entity.js';

export class ListCustomer extends PickType(Customer, [
  '_id',
  'CustomerName',
  'code',
  'disabled',
]) { }
