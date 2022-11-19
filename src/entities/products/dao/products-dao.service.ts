import { Inject, Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { isUndefined, pickBy } from 'lodash';
import { Collection, ObjectId } from 'mongodb';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductFilter, ProductQuery } from '../dto/product-query.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CustomerProduct } from '../entities/customer-product.interface';
import { Product } from '../entities/product.entity';
import { ProductProductionStage } from '../entities/production-stage';
import { PRODUCTS_COLLECTION } from './products-collection.provider';
import { flatten } from 'flat';


@Injectable()
export class ProductsDaoService {
  constructor(
    @Inject(PRODUCTS_COLLECTION)
    private readonly collection: Collection<Product>,
  ) { }

  async insertOne(product: CreateProductDto): Promise<Product | null> {
    const { value } = await this.collection.findOneAndReplace(
      { name: product.name },
      product,
      { upsert: true, returnDocument: 'after' },
    );
    return value;
  }

  async updateOne(
    _id: ObjectId,
    product: UpdateProductDto,
  ): Promise<Product | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { _id },
      { $set: flatten(product, { safe: true }) },
      { returnDocument: 'after' },
    );
    return value;
  }

  async deleteOne(_id: ObjectId): Promise<number | undefined> {
    const { deletedCount } = await this.collection.deleteOne({ _id });
    return deletedCount;
  }

  async getAll({
    limit,
    start,
    ...query
  }: ProductQuery): Promise<Partial<Product>[]> {
    const filterClass = plainToClass(ProductFilter, query);

    const projection = {
      _id: 1,
      category: 1,
      name: 1,
      inactive: 1,
    };
    return this.collection
      .find(pickBy(classToPlain(filterClass), (value) => !isUndefined(value)))
      .project(projection)
      .sort({ name: 1 })
      .skip(start)
      .limit(limit)
      .toArray();
  }

  async getOne(idOrName: ObjectId | string): Promise<Product | null> {
    if (idOrName instanceof ObjectId) {
      return this.collection.findOne({ _id: idOrName });
    } else {
      return this.collection.findOne({ name: idOrName });
    }
  }

  async getCustomerProducts(customerName: string): Promise<CustomerProduct[]> {
    const allProductsPipeline = [
      {
        $addFields: {
          idx: {
            $indexOfArray: ['$prices.customerName', customerName],
          },
        },
      },
      {
        $addFields: {
          price: {
            $cond: {
              if: { $eq: ['$idx', -1] },
              then: undefined,
              else: {
                $arrayElemAt: ['$prices', '$idx'],
              },
            },
          },
          isPrice: {
            $toBool: { $add: ['$idx', 1] },
          },
        },
      },
      {
        $sort: {
          isPrice: -1,
          'price.lastUsed': -1,
          name: 1,
        },
      },
      {
        $project: {
          _id: 0,
          productName: '$name',
          category: 1,
          description: 1,
          customerName: '$price.customerName',
          price: '$price.price',
          lastUsed: '$price.lastUsed',
          units: 1,
        },
      },
    ];
    return this.collection
      .aggregate<CustomerProduct>(allProductsPipeline)
      .toArray();
  }

  async touchProduct(customer: string, productNames: string[]) {
    const { modifiedCount } = await this.collection.updateMany(
      {
        name: { $in: productNames },
        'prices.customerName': customer,
      },
      {
        $currentDate: {
          'prices.$.lastUsed': true,
        },
      },
      {
        writeConcern: { w: 0 },
      },
    );

    return modifiedCount;
  }

  async validate<K extends keyof Product>(property: K): Promise<Product[K][]> {
    return this.collection
      .find({})
      .project({ _id: 0, [property]: 1 })
      .map((prod) => prod[property])
      .toArray();
  }

  async getProductionStages(name: string) {
    const pipeline = [
      {
        $match: {
          name,
        },
      },
      {
        $unwind: {
          path: '$productionStages',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$productionStages',
        },
      },
      {
        $lookup: {
          from: 'productionStages',
          localField: 'productionStageId',
          foreignField: '_id',
          as: 'stage',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ['$stage', 0] }, '$$ROOT'],
          },
        },
      },
      {
        $project: {
          stage: 0,
          _id: 0,
        },
      },
    ];
    return this.collection
      .aggregate<ProductProductionStage>(pipeline)
      .toArray();
  }
}
