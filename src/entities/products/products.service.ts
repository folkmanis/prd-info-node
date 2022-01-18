import { Injectable } from '@nestjs/common';
import { ProductsDaoService } from './dao/products-dao.service';
import { Job } from '../jobs/entities/job.entity';
import { PickType } from '@nestjs/mapped-types';
import { Observable, from, of } from 'rxjs';

export class JobLike extends PickType(Job, ['customer', 'products']) {}

@Injectable()
export class ProductsService {
  constructor(private readonly productsDao: ProductsDaoService) {}

  touchProducts({ customer, products }: JobLike): Observable<any> {
    const names: string[] = products?.map((prod) => prod.name) || [];
    if (!names.length) {
      return of(false);
    }
    return from(this.productsDao.touchProduct(customer, names));
  }
}
