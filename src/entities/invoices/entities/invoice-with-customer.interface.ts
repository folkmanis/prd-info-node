import { Invoice } from './invoice.entity.js';
import { Customer } from '../../customers/entities/customer.entity.js';

export type InvoiceWithCustomer = Invoice & {
  customerInfo: Customer;
  total: number;
};
