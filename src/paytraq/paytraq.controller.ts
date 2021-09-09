import {
    Body, Controller,
    Get, Param, ParseIntPipe,
    Put, Query
} from '@nestjs/common';
import { Modules } from '../login';
import { RequestParameters } from './interfaces/request-parameters';
import { SalesInput } from './interfaces/sales-input';
import { PaytraqDaoService } from './paytraq-dao/paytraq-dao.service';
import { RequestParametersPipe } from './request-parameters.pipe';
import { SaleValidatorPipe } from './sale-validator.pipe';

@Controller('paytraq')
@Modules('jobs')
export class PaytraqController {
    constructor(private paytraqDao: PaytraqDaoService) { }

    @Get('clients')
    async getClients(@Query(RequestParametersPipe) query: RequestParameters) {
        return this.paytraqDao.getClients(query);
    }

    @Get('client/:id')
    async getClient(@Param('id', ParseIntPipe) id: number) {
        return this.paytraqDao.getClient(id);
    }

    @Get('products')
    async getProducts(@Query(RequestParametersPipe) query: RequestParameters) {
        return this.paytraqDao.getProducts(query);
    }

    @Get('product/:id')
    async getProduct(@Param('id', ParseIntPipe) id: number) {
        return this.paytraqDao.getProduct(id);
    }

    @Get('sales')
    async getSales(@Query(RequestParametersPipe) query: RequestParameters) {
        return this.paytraqDao.getSales(query);
    }

    @Get('sale/:id')
    async getSale(@Param('id', ParseIntPipe) id: number) {
        return this.paytraqDao.getSale(id);
    }

    @Put('sale')
    async postSale(@Body(SaleValidatorPipe) data: SalesInput) {
        const resp = await this.paytraqDao.postSale(data);
        if (!resp.response?.documentID) {
            throw new Error(JSON.stringify(resp));
        }

        return resp;
    }
}
