import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { JobProduct } from './job-product.entity.js';
import { Job } from './job.entity.js';

export class JobOneProduct extends OmitType(Job, ['products']) {
  @Type(() => JobProduct)
  @IsOptional()
  @ValidateNested({ each: true })
  products: JobProduct;

  @IsNumber()
  productsIdx: number;
}
