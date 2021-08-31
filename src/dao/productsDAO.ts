import {
    BulkWriteOperation, Collection, Db,
    FilterQuery, ObjectId, UpdateQuery
} from "mongodb";
import {
    CustomerProduct, Product, ProductionStage,
    ProductNoId, ProductNoPrices, ProductPriceImport,
    ProductResult, ProductProductionStage
} from '../interfaces';
import { Dao } from '../interfaces/dao.interface';
import Logger from '../lib/logger';

const PRODUCTS_COLLECTION_NAME = 'products';
const DEFAULT_UNIT = 'gab.';

export class ProductsDao extends Dao {

    products!: Collection<Product>;

    async injectDb(db: Db): Promise<void> {
        if (this.products) { return; }
        try {
            this.products = db.collection(PRODUCTS_COLLECTION_NAME);
            await this.updateDb()
                .then(_ => this.createIndexes());
        } catch (err) {
            Logger.error('Customers DAO', err);
            return;
        }
    }

    async insertNewProduct(prod: ProductNoId): Promise<string | null> {
        return this.products.insertOne(prod)
            .then(result => this.products.findOne({ _id: result.insertedId }))
            .then(result => result?.name || null);
    }

    async insertNewProducts(prod: ProductNoPrices[]): Promise<ProductResult> {
        if (!(prod && prod.length)) { return { error: null, insertedCount: 0 }; }
        return this.products.insertMany(prod)
            .then(result => ({
                insertedCount: result.insertedCount,
                error: !result.result.ok,
            }))
            .catch(error => ({ error }));
    }

    async getProducts(category?: string): Promise<ProductResult> {
        const filter: Partial<Product> = {};
        if (category) {
            filter.category = category;
        }
        const projection = {
            _id: 1,
            category: 1,
            name: 1,
            inactive: 1,
        };
        const result = this.products.find(filter)
            .project(projection)
            .sort({ name: 1 })
            .toArray();
        return {
            data: await result,
            error: false,
        };
    }

    async getProduct(name: string): Promise<Product | null> {
        return this.products.findOne({ name });
    }

    async getCustomerProducts(customerName: string): Promise<ProductResult> {
        const allProductsPipeline = [
            {
                '$addFields': {
                    'idx': {
                        '$indexOfArray': [
                            '$prices.customerName', customerName
                        ]
                    }
                }
            }, {
                '$addFields': {
                    'price': {
                        '$cond': {
                            'if': { '$eq': ['$idx', -1] },
                            'then': undefined,
                            'else': {
                                '$arrayElemAt': ['$prices', '$idx']
                            }
                        }
                    },
                    'isPrice': {
                        '$toBool': { '$add': ['$idx', 1] }
                    }
                }
            }, {
                '$sort': {
                    'isPrice': -1,
                    'price.lastUsed': -1,
                    'name': 1
                }
            }, {
                '$project': {
                    '_id': 0,
                    'productName': '$name',
                    'category': 1,
                    'description': 1,
                    'customerName': '$price.customerName',
                    'price': '$price.price',
                    'lastUsed': '$price.lastUsed',
                    'units': 1,
                }
            }
        ];
        try {
            const customerProducts = await this.products.aggregate<CustomerProduct>(allProductsPipeline).toArray();
            return {
                customerProducts,
                error: false,
            };
        } catch (error) { return { error }; }
    }

    async getProductionStages(name: string): Promise<ProductionStage[]> {
        const pipeline = [{
            $match: {
                name
            }
        }, {
            $unwind: {
                path: '$productionStages'
            }
        }, {
            $replaceRoot: {
                newRoot: '$productionStages'
            }
        }, {
            $lookup: {
                from: 'productionStages',
                localField: 'productionStageId',
                foreignField: '_id',
                as: 'stage'
            }
        }, {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        { $arrayElemAt: ['$stage', 0] },
                        '$$ROOT'
                    ]
                }
            }
        }, {
            $project: {
                stage: 0,
                _id: 0,
            }
        }
        ];
        const result = await this.products.aggregate<ProductionStage>(pipeline).toArray();

        return result;
    }

    async deleteProduct(name: string): Promise<ProductResult> {
        const result = await this.products.deleteOne({ name });
        return {
            deletedCount: result.deletedCount,
            error: !result.result.ok,
        };
    }

    async updateProduct(name: string, prod: ProductNoId): Promise<ProductResult> {
        if (prod.productionStages) {
            prod.productionStages = prod.productionStages
                .map(this.mapProdStage);
        }
        const result = await this.products.updateOne({ name }, { $set: prod });
        return {
            modifiedCount: result.modifiedCount,
            error: !result.result.ok,
        };
    }

    private mapProdStage(stage: ProductProductionStage): ProductProductionStage {
        if (stage.materials) {
            stage.materials = stage.materials.map(mat => ({ ...mat, materialId: new ObjectId(mat.materialId) }));
        }
        stage.productionStageId = new ObjectId(stage.productionStageId);
        return stage;
    }

    async productPrices(name: string): Promise<ProductResult> {
        const result = await this.products.findOne({ name }, { projection: { prices: 1 } });
        return {
            error: !result,
            prices: result ? result.prices : [],
        };
    }

    async touchProduct(customer: string, data: string[]): Promise<ProductResult> {
        const filter: FilterQuery<Product> = {
            name: { $in: data },
            'prices.customerName': customer,
        };
        const update: UpdateQuery<Product> = {
            $currentDate: {
                'prices.$.lastUsed': true
            }
        };
        try {
            const resp = await this.products.updateMany(filter, update, { writeConcern: { w: 0 } });
            return {
                error: false,
            };
        } catch (error) { return { error }; }
    }

    async updatePrice(name: string, customer: string, price: number): Promise<ProductResult> {
        const result = await this.products.updateOne(
            { name, "prices.customer": customer },
            {
                $set: {
                    "prices.$.price": +price
                }
            }
        );
        return {
            modifiedCount: result.modifiedCount,
            result: result.result,
            error: !result.result.ok,
        };
    }

    async addPrice(name: string, customerName: string, price: number): Promise<ProductResult> {
        const result = await this.products.updateOne(
            { name },
            {
                $addToSet: {
                    prices: { customerName, price }
                }
            }
        );
        return {
            modifiedCount: result.modifiedCount,
            result: result.result,
            error: !result.result.ok,
        };
    }

    async addPrices(prices: ProductPriceImport[]): Promise<ProductResult> {
        if (!(prices && prices.length > 0)) { return { error: null, insertedCount: 0 }; }
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
                        }
                    }
                }
            });
        }
        return this.products.bulkWrite(update)
            .then(result => ({
                error: !result.result,
                insertedCount: result.modifiedCount,
            }))
            .catch(error => ({ error }));
    }

    async deletePrice(name: string, customerName: string): Promise<ProductResult> {
        const result = await this.products.updateOne(
            { name },
            {
                $pull: {
                    prices: {
                        customerName,
                    }
                }
            },
        );
        return {
            deletedCount: result.modifiedCount,
            result: result.result,
            error: !result.result.ok
        };
    }

    async validate(property: keyof Product): Promise<ProductResult> {
        const result = (await this.products.find({}).project({ _id: 0, [property]: 1 }).toArray())
            .map((doc: Partial<Product>) => doc[property]);
        return {
            validatorData: result,
            error: null,
        };
    }

    async getCustomersProducts(
        customerProducts: {
            customerName: string;
            product: string;
        }[]
    ): Promise<ProductResult> {
        const aggr = [
            {
                '$unwind': { 'path': '$prices' }
            }, {
                '$addFields': {
                    'custPrice.customerName': '$prices.customerName',
                    'custPrice.product': '$name'
                }
            }, {
                '$match': {
                    'custPrice': {
                        '$in': customerProducts
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'product': '$name',
                    'customerName': '$custPrice.customerName',
                    'price': '$prices.price',
                }
            }
        ];
        try {
            const result = await this.products.aggregate(aggr).toArray();
            return {
                data: result,
                error: null,
            };
        } catch (error) { return { error }; }
    }

    private createIndexes(): Promise<any> {
        return this.products.createIndexes([
            {
                key: { category: 1, },
            },
            {
                key: { name: 1, },
                unique: true,
            },
            {
                key: {
                    _id: 1,
                    'prices.0': 1
                },
                name: 'prices',
                unique: true,
            }
        ]);
    }

    private async updateDb(): Promise<void> {
        return this.products.updateMany({ units: { $exists: false } }, { $set: { units: DEFAULT_UNIT } })
            .then(result => {
                if (result.modifiedCount > 0) {
                    Logger.info(`Products Collection updated. ${result.modifiedCount} records set units to '${DEFAULT_UNIT}'`);
                }
                return;
            });
    }
}