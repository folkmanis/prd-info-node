import { Product } from '../entities/product.entity';
import { PickType, OmitType, PartialType, IntersectionType } from '@nestjs/mapped-types';

export class CreateProductDto extends OmitType(Product, ['_id']) { }
