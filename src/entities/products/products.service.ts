import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsDaoService } from './dao/products-dao.service';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class ProductsService {

  constructor(
    private readonly productsDao: ProductsDaoService,
  ) { }

  async touchProducts({ customer, products }: Job) {
    const names: string[] = products?.map(prod => prod.name) || [];
    if (!names.length) {
      return;
    }
    return this.productsDao.touchProduct(customer, names);
  }

}
