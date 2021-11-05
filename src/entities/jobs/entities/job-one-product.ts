import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';
import { JobProduct } from './job-product.entity';
import { Job } from './job.entity';

export class JobOneProduct extends OmitType(Job, ['products']) {

    @Type(() => JobProduct)
    @ValidateNested({ each: true })
    products: JobProduct;

    @IsNumber()
    productsIdx: number;
}