import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, Patch, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { Modules } from '../../login';
import { CustomersDaoService } from './customers-dao/customers-dao.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomer } from './dto/list-customer.dto';
import { Customer } from './entities/customer.entity';
import { StartAndLimit } from '../../lib/query-start-limit.pipe';
import { CustomersQuery } from './dto/customers-query';


@Controller('customers')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CustomersController {

  constructor(
    private readonly customersDao: CustomersDaoService
  ) { }


  @Put()
  async newCustomer(
    @Body() customer: CreateCustomerDto
  ): Promise<Customer> {
    return this.customersDao.insertOne(customer);
  }

  @Patch(':id')
  async updateCustomer(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Body() customer: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersDao.updateOne(_id, customer);
  }

  @Delete(':id')
  async deleteCustomer(
    @Param('id', ObjectIdPipe) _id: ObjectId,
  ): Promise<number> {
    return this.customersDao.deleteOne(_id);
  }

  @Get('validate/:property')
  async validate(
    @Param('property', new ValidateObjectKeyPipe<Customer>('CustomerName', 'code')) property: keyof Customer
  ) {
    return this.customersDao.validate(property);
  }

  @Get(':id')
  async getById(
    @Param('id', ObjectIdPipe) id: ObjectId
  ) {
    return this.customersDao.getCustomerById(id);
  }

  @Get()
  async getAll(
    @Query() query: CustomersQuery,
  ): Promise<ListCustomer[]> {
    return this.customersDao.getCustomers(query);
  }


}

