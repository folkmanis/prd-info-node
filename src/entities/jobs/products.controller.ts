import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Modules } from '../../login';
import { ProductsQuery } from './dto/products-query';
import { JobsProductsDaoService } from './dao/jobs-products-dao.service';

@Controller('jobs/products')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Modules('jobs')
export class ProductsController {
  constructor(private dao: JobsProductsDaoService) {}

  @Get('')
  async jobProducts(@Query() query: ProductsQuery) {
    return this.dao.getProductsTotals(query.toFilter(), query);
  }
}
