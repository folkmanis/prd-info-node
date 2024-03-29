import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { Modules } from '../../login';
import { CustomersDaoService } from './customers-dao/customers-dao.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomersQuery } from './dto/customers-query';
import { ListCustomer } from './dto/list-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { CustomerNotifyInterceptor } from './customer-notify.interceptor';

@Controller('customers')
@Modules('jobs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CustomersController {
  constructor(private readonly customersDao: CustomersDaoService) {}

  @Put()
  async newCustomer(@Body() customer: CreateCustomerDto) {
    return this.customersDao.insertOne(customer);
  }

  @Patch(':id')
  @UseInterceptors(CustomerNotifyInterceptor)
  async updateCustomer(
    @Param('id', ObjectIdPipe) _id: ObjectId,
    @Body() customer: UpdateCustomerDto,
  ) {
    return this.customersDao.updateOne(_id, customer);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id', ObjectIdPipe) _id: ObjectId) {
    return this.customersDao.deleteOne(_id);
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
  async getById(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.customersDao.getCustomerById(id);
  }

  @Get()
  async getAll(@Query() query: CustomersQuery): Promise<ListCustomer[]> {
    return this.customersDao.getCustomers(query.toFilter());
  }
}
