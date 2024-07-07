import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { ProductsCollectionProvider } from './dao/products-collection.provider.js';
import { ProductsDaoService } from './dao/products-dao.service.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsCollectionProvider, ProductsDaoService, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
