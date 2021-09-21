import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { PRODUCTS_COLLECTION } from './products-collection.provider';
import { Product } from '../entities/product.entity';
import { Collection, FilterQuery, UpdateQuery } from 'mongodb';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFilter, ProductQuery } from '../dto/product-query.dto';
import { plainToClassFromExist, classToPlain, plainToClass } from 'class-transformer';
import { isUndefined, pickBy } from 'lodash';
import { CustomerProduct } from '../entities/customer-product.interface';

@Injectable()
export class ProductsDaoService {

    // private readonly logger = new Logger(ProductsDaoService.name);

    constructor(
        @Inject(PRODUCTS_COLLECTION) private readonly collection: Collection<Product>
    ) { }

    async insertOne(product: CreateProductDto): Promise<Product | undefined> {
        const { value } = await this.collection.findOneAndReplace(
            { name: product.name },
            product,
            { upsert: true, returnDocument: 'after' }
        );
        return value;
    }

    async updateOne(name: string, product: UpdateProductDto): Promise<Product | undefined> {
        const { value } = await this.collection.findOneAndUpdate(
            { name },
            { $set: product },
            { returnDocument: 'after' }
        );
        return value;
    }

    async deleteOne(name: string): Promise<number> {
        const { deletedCount } = await this.collection.deleteOne({ name });
        return deletedCount || 0;
    }


    async getAll({ limit, start, ...query }: ProductQuery): Promise<Partial<Product>[]> {
        const filterClass = plainToClass(ProductFilter, query);

        const projection = {
            _id: 1,
            category: 1,
            name: 1,
            inactive: 1,
        };
        return this.collection
            .find(pickBy(classToPlain(filterClass), value => !isUndefined(value)))
            .project(projection)
            .sort({ name: 1 })
            .skip(start)
            .limit(limit)
            .toArray();
    }

    async getOne(name: string): Promise<Product | null> {
        return this.collection.findOne({ name });
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
            });

        return modifiedCount;
    }

    async validate<K extends keyof Product>(property: K): Promise<Product[K][]> {
        return this.collection
            .find({})
            .project({ _id: 0, [property]: 1 })
            .map(prod => prod[property])
            .toArray();
    }


    /*
    
        async getProductionStages(name: string): Promise<ProductionStage[]> {
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
            const result = await this.products
                .aggregate<ProductionStage>(pipeline)
                .toArray();
    
            return result;
        }
    
    
        private mapProdStage(stage: ProductProductionStage): ProductProductionStage {
            if (stage.materials) {
                stage.materials = stage.materials.map((mat) => ({
                    ...mat,
                    materialId: new ObjectId(mat.materialId),
                }));
            }
            stage.productionStageId = new ObjectId(stage.productionStageId);
            return stage;
        }
    
        async productPrices(name: string): Promise<ProductResult> {
            const result = await this.products.findOne(
                { name },
                { projection: { prices: 1 } },
            );
            return {
                error: !result,
                prices: result ? result.prices : [],
            };
        }
    
        async updatePrice(
            name: string,
            customer: string,
            price: number,
        ): Promise<ProductResult> {
            const result = await this.products.updateOne(
                { name, 'prices.customer': customer },
                {
                    $set: {
                        'prices.$.price': +price,
                    },
                },
            );
            return {
                modifiedCount: result.modifiedCount,
                result: result.result,
                error: !result.result.ok,
            };
        }
    
        async addPrice(
            name: string,
            customerName: string,
            price: number,
        ): Promise<ProductResult> {
            const result = await this.products.updateOne(
                { name },
                {
                    $addToSet: {
                        prices: { customerName, price },
                    },
                },
            );
            return {
                modifiedCount: result.modifiedCount,
                result: result.result,
                error: !result.result.ok,
            };
        }
    
        async addPrices(prices: ProductPriceImport[]): Promise<ProductResult> {
            if (!(prices && prices.length > 0)) {
                return { error: null, insertedCount: 0 };
            }
            const update: BulkWriteOperation<Product>[] = [];
            for (const { price, product, customerName } of prices) {
                update.push({
                    updateOne: {
                        filter: {
                            name: product,
                        },
                        update: {
                            $addToSet: {
                                prices: { customerName, price },
                            },
                        },
                    },
                });
            }
            return this.products
                .bulkWrite(update)
                .then((result) => ({
                    error: !result.result,
                    insertedCount: result.modifiedCount,
                }))
                .catch((error) => ({ error }));
        }
    
        async deletePrice(
            name: string,
            customerName: string,
        ): Promise<ProductResult> {
            const result = await this.products.updateOne(
                { name },
                {
                    $pull: {
                        prices: {
                            customerName,
                        },
                    },
                },
            );
            return {
                deletedCount: result.modifiedCount,
                result: result.result,
                error: !result.result.ok,
            };
        }
        
        async getCustomersProducts(
            customerProducts: {
                customerName: string;
                product: string;
            }[],
        ): Promise<ProductResult> {
            const aggr = [
                {
                    $unwind: { path: '$prices' },
                },
                {
                    $addFields: {
                        'custPrice.customerName': '$prices.customerName',
                        'custPrice.product': '$name',
                    },
                },
                {
                    $match: {
                        custPrice: {
                            $in: customerProducts,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        product: '$name',
                        customerName: '$custPrice.customerName',
                        price: '$prices.price',
                    },
                },
            ];
            try {
                const result = await this.products.aggregate(aggr).toArray();
                return {
                    data: result,
                    error: null,
                };
            } catch (error) {
                return { error };
            }
        }
     */

    /*     async insertNewProducts(prod: ProductNoPrices[]): Promise<ProductResult> {
    if (!(prod && prod.length)) {
        return { error: null, insertedCount: 0 };
    }
    return this.products
        .insertMany(prod)
        .then((result) => ({
            insertedCount: result.insertedCount,
            error: !result.result.ok,
        }))
        .catch((error) => ({ error }));
}
*/



}