import { Module } from '@nestjs/common';
import { UsersModule } from './users';
import { CustomersModule } from './customers/customers.module';

@Module({
    imports: [
        UsersModule,
        CustomersModule,
    ]
})
export class EntitiesModule { }
