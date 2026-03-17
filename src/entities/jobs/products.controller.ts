import {
  Controller,
  Get,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { Modules } from '../../login/index.js';
import { ProductsQuery } from './dto/products-query.js';
import { JobsService } from './jobs.service.js';

@Controller('jobs/products')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Modules('jobs')
export class ProductsController {
  constructor(private readonly service: JobsService) {}

  @Get('report')
  async jobProductsReport(@Query() query: ProductsQuery, @Res() res: Response) {
    const pdf = await this.service.getJobProductsReport(query);
    const stream = await pdf.getStream();
    res.contentType('application/pdf');
    stream.pipe(res);
    stream.end();

    return {}; // not null response for interceptor
  }

  @Get('')
  async jobProducts(@Query() query: ProductsQuery) {
    return this.service.getJobProductsTotals(query);
  }
}
