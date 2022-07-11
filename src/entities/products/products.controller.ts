import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ValidationPipe,
  UsePipes,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQuery } from './dto/product-query.dto';
import { Modules } from '../../login';
import { ProductsDaoService } from './dao/products-dao.service';
import { Product } from './entities/product.entity';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { ObjectId } from 'mongodb';

@Controller('products')
@Modules('jobs')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsDao: ProductsDaoService,
  ) { }

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

  @Get(':id')
  async getone(@Param('id', ObjectIdPipe) id: ObjectId) {
    return this.productsDao.getOne(id);
  }

  @Get()
  async getAll(@Query() query: ProductQuery) {
    return this.productsDao.getAll(query);
  }

  @Modules('jobs-admin')
  @Put()
  async insertOne(@Body() product: CreateProductDto) {
    return this.productsDao.insertOne(product);
  }

  @Modules('jobs-admin')
  @Patch(':id')
  async updateOne(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Body() product: UpdateProductDto,
  ) {
    return this.productsDao.updateOne(id, product);
  }

  @Modules('jobs-admin')
  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteProducts(@Param('id', ObjectIdPipe) name: ObjectId) {
    return this.productsDao.deleteOne(name);
  }

}
