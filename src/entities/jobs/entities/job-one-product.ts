import { OmitType, IntersectionType } from '@nestjs/mapped-types';
import { Job } from './job.entity';
import { JobProduct } from './job-product.entity';

export class JobOneProduct extends OmitType(Job, ['products']) {
    products: JobProduct;
    productsIdx: number;
}