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
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ObjectIdDto } from '../../lib/zod-validators.js';
import { Modules } from '../../login/index.js';
import { ProductsDaoService } from './dao/products-dao.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductQueryDto } from './dto/product-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';

@Controller('products')
@Modules('jobs')
export class ProductsController {
  constructor(private readonly productsDao: ProductsDaoService) {}

  @Get(':name/productionStages')
  async getProductionStages(@Param('name') name: string) {
    return this.productsDao.getProductionStages(name);
  }

  @Get('prices/customer/:customer')
  async getCustomerPrices(@Param('customer') customer: string) {
    return this.productsDao.getCustomerProducts(customer);
  }

  @Get('validate/:property')
  async validate(
    @Param('property', new ValidateObjectKeyPipe<Product>('name'))
    property: keyof Product,
  ) {
    return this.productsDao.validate(property);
  }

  @Get('name/:name')
  async getOneByName(@Param('name') name: string) {
    return this.productsDao.getOne(name);
  }

  @Get(':id')
  async getone(@Param('id') id: ObjectIdDto) {
    return this.productsDao.getOne(id);
  }

  @Get()
  async getAll(@Query() query: ProductQueryDto) {
    return this.productsDao.getAll(query);
  }

  @Modules('jobs-admin')
  @Put()
  async insertOne(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    product: CreateProductDto,
  ) {
    return this.productsDao.insertOne(product);
  }

  @Modules('jobs-admin')
  @Patch(':id')
  async updateOne(
    @Param('id') id: ObjectIdDto,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    product: UpdateProductDto,
  ) {
    return this.productsDao.updateOne(id, product);
  }

  @Modules('jobs-admin')
  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteProducts(@Param('id') name: ObjectIdDto) {
    return this.productsDao.deleteOne(name);
  }
}
