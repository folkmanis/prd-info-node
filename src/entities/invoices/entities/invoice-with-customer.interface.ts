import { Invoice } from './invoice.entity';
import { Customer } from '../../customers/entities/customer.entity';

export type InvoiceWithCustomer = Invoice & {
  customerInfo: Customer;
  total: number;
};
