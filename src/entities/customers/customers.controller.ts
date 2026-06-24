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
} from '@nestjs/common';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import z from 'zod';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { CustomerNotifyInterceptor } from './customer-notify.interceptor.js';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { CustomerList, CustomerListDto } from './dto/customer-list.dto.js';
import { CustomerDto } from './dto/customer.dto.js';
import { CustomersQuery } from './dto/customers-query.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Customer } from './entities/customer.entity.js';

@Controller('customers')
@Modules('jobs')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @ZodResponse({ type: CustomerDto })
  @Put()
  @Modules('jobs-admin')
  async newCustomer(@Body() customer: CreateCustomerDto) {
    return this.service.insertOne(customer);
  }

  @ZodResponse({ type: CustomerDto })
  @Patch(':id')
  @Modules('jobs-admin')
  @UseInterceptors(CustomerNotifyInterceptor)
  async updateCustomer(
    @Param('id') id: ObjectIdDto,
    @Body() customer: UpdateCustomerDto,
  ) {
    return this.service.updateOne(id, customer);
  }

  @ZodResponse({ type: createZodDto(z.number()) })
  @Modules('jobs-admin')
  @Delete(':id')
  async deleteCustomer(@Param('id') id: ObjectIdDto) {
    return this.service.deleteOne(id);
  }

  @ZodResponse({ type: createZodDto(z.boolean()) })
  @Get('validate/:property')
  async validate(
    @Param(
      'property',
      new ValidateObjectKeyPipe<Customer>('customerName', 'code'),
    )
    property: keyof Customer,
    @Query('value') value: string,
  ) {
    return this.service.validateProperty(property, value);
  }

  @ZodResponse({ type: CustomerDto })
  @Get(':id')
  async getById(@Param('id') id: ObjectIdDto) {
    return this.service.getCustomerById(id);
  }

  @ZodResponse({ type: [CustomerListDto] })
  @Get()
  async getAll(@Query() query: CustomersQuery): Promise<CustomerList[]> {
    return this.service.getCustomers(query);
  }
}
