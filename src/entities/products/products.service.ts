import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsDaoService } from './dao/products-dao.service';
import { Job } from '../jobs/entities/job.entity';
import { JobProduct } from '../jobs/entities/job-product.entity';
import { PickType } from '@nestjs/mapped-types';
import { Observable, from, of } from 'rxjs';
import { mergeMap, tap, map } from 'rxjs/operators';

export class JobLike extends PickType(Job, ['customer', 'products']) { }

@Injectable()
export class ProductsService {

  constructor(
    private readonly productsDao: ProductsDaoService,
  ) { }

  touchProducts({ customer, products }: JobLike): Observable<any> {
    const names: string[] = products?.map(prod => prod.name) || [];
    if (!names.length) {
      return of(false);
    }
    return from(this.productsDao.touchProduct(customer, names));
  }

}
