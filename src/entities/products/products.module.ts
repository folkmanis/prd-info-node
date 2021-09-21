import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsCollectionProvider } from './dao/products-collection.provider';
import { ProductsDaoService } from './dao/products-dao.service';

@Module({
  controllers: [
    ProductsController
  ],
  providers: [
    ProductsCollectionProvider,
    ProductsDaoService,
    ProductsService,
  ],
  exports: [
    ProductsService,
  ]
})
export class ProductsModule { }
