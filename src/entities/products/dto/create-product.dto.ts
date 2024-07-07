import { Product } from '../entities/product.entity.js';
import { OmitType } from '@nestjs/mapped-types';

export class CreateProductDto extends OmitType(Product, ['_id']) { }
