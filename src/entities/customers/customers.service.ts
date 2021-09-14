import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersDaoService } from './customers-dao/customers-dao.service';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {

    constructor(
        private readonly customersDao: CustomersDaoService,
    ) { }

    async getCustomerByName(name: string): Promise<Customer> {
        return this.customersDao.getCustomerByName(name);
    }

}
