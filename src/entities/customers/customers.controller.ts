import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { CustomerNotifyInterceptor } from './customer-notify.interceptor.js';
import { CustomersDaoService } from './customers-dao/customers-dao.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { CustomersQuery } from './dto/customers-query.js';
import { ListCustomer } from './dto/list-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Customer } from './entities/customer.entity.js';

@Controller('customers')
@Modules('jobs')
export class CustomersController {
  constructor(private readonly customersDao: CustomersDaoService) {}

  @Put()
  async newCustomer(
    @Body(new ValidationPipe({ transform: true })) customer: CreateCustomerDto,
  ) {
    return this.customersDao.insertOne(customer);
  }

  @Patch(':id')
  @UseInterceptors(CustomerNotifyInterceptor)
  async updateCustomer(
    @Param('id') _id: ObjectIdDto,
    @Body(new ValidationPipe({ transform: true })) customer: UpdateCustomerDto,
  ) {
    return this.customersDao.updateOne(_id, customer);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: ObjectIdDto) {
    return this.customersDao.deleteOne(id);
  }

  @Get('validate/:property')
  async validate(
    @Param(
      'property',
      new ValidateObjectKeyPipe<Customer>('CustomerName', 'code'),
    )
    property: keyof Customer,
  ) {
    return this.customersDao.validate(property);
  }

  @Get(':id')
  async getById(@Param('id') id: ObjectIdDto) {
    return this.customersDao.getCustomerById(id);
  }

  @Get()
  async getAll(
    @Query(new ValidationPipe({ transform: true })) query: CustomersQuery,
  ): Promise<ListCustomer[]> {
    return this.customersDao.getCustomers(query.toFilter());
  }
}
