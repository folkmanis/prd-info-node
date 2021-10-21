import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ValidationPipe, UsePipes, Query, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilter, ProductQuery } from './dto/product-query.dto';
import { Modules } from '../../login';
import { ProductsDaoService } from './dao/products-dao.service';
import { Product } from './entities/product.entity';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';

@Controller('products')
@Modules('jobs')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ProductsController {

  constructor(
    private readonly productsService: ProductsService,
    private readonly productsDao: ProductsDaoService,
  ) { }

  @Get(':name/productionStages')
  async getProductionStages(
    @Param('name') name: string
  ) {
    return this.productsDao.getProductionStages(name);
  }

  @Get('prices/customer/:customer')
  async getCustomerPrices(
    @Param('customer') customer: string
  ) {
    return this.productsDao.getCustomerProducts(customer);
  }

  @Get('validate/:property')
  async validate(
    @Param('property', new ValidateObjectKeyPipe<Product>('name')) property: keyof Product
  ) {
    return this.productsDao.validate(property);
  }

  @Get(':name')
  async getone(
    @Param('name') name: string
  ) {
    return this.productsDao.getOne(name);
  }


  @Get()
  async getAll(
    @Query() query: ProductQuery
  ) {
    return this.productsDao.getAll(query);
  }

  @Modules('jobs-admin')
  @Put()
  async insertOne(
    @Body() product: CreateProductDto,
  ) {
    return this.productsDao.insertOne(product);
  }

  @Modules('jobs-admin')
  @Patch(':name')
  async updateOne(
    @Param('name') name: string,
    @Body() product: UpdateProductDto,
  ) {
    return this.productsDao.updateOne(name, product);
  }

  @Modules('jobs-admin')
  @Delete(':name')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteProducts(
    @Param('name') name: string
  ) {
    return this.productsDao.deleteOne(name);
  }

  /*     @Get('category/:name')
    private async getByCategory(req: Request, res: Response) {
      const category = <string | undefined>req.params.name;
      if (!category) {
        res.status(404).json({ error: 'invalid request' });
      } else {
        res.json(await this.productsDao.getProducts(category));
      }
    }
 */
  /*     @Get('prices/customers')
      private async getPricesCustomers(req: Request, res: Response) {
        const filter = JSON.parse(req.query.filter as string) as {
          customerName: string;
          product: string;
        }[];
        res.json(await this.productsDao.getCustomersProducts(filter));
      }
   */

  /*     @Get(':name/prices')
      private async getProductPrices(req: Request, res: Response) {
        const name = req.params.name;
        res.json(await this.productsDao.productPrices(name));
      }
    
   */

  /*     @Middleware(PrdSession.validateModule('jobs-admin'))
@Delete(':name/price/:customer')
private async deleteCustomerPrice(req: Request, res: Response) {
  const name = req.params.name;
  const customer = <string>req.params.customer;
  res.json(await this.productsDao.deletePrice(name, customer));
}
*/

  /*     @Middleware(PrdSession.validateModule('jobs-admin'))
      @Put(':name/price/:customer')
      private async addCustomerPrice(req: Request, res: Response) {
        const name = req.params.name;
        const customer = <string>req.params.customer;
        const price: number = req.body.price;
        if (price !== +price) {
          throw new Error('nuber required');
        }
        res.json(await this.productsDao.addPrice(name, customer, +price));
      }
   */

  /*     @Middleware(PrdSession.validateModule('jobs-admin'))
@Post(':name/price/:customer')
private async setCustomerPrice(req: Request, res: Response) {
  const name = req.params.name;
  const customer = <string>req.params.customer;
  const price: number = req.body.price;
  if (price !== +price) {
    throw new Error('nuber required');
  }
  res.json(await this.productsDao.updatePrice(name, customer, +price));
}
*/

  /*   @Middleware(PrdSession.validateModule('jobs-admin'))
@Post(':name/prices')
private async updatePrices(req: Request, res: Response) {
  const name = req.params.name;
  const product: Pick<Product, 'prices'> = { prices: req.body };
  res.json({ name, product });
}
*/

}
