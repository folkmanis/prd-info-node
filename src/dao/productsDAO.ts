import {
    MongoClient, Collection, DeleteWriteOpResultObject,
    FilterQuery, Double, BulkWriteOperation, UpdateQuery, BulkWriteUpdateOneOperation
} from "mongodb";
import Logger from '../lib/logger';
import { Product, ProductResult, ProductNoId, CustomerProduct, ProductNoPrices, ProductPriceImport } from '../interfaces';

let products: Collection<Product>;
const PRODUCTS_COLLECTION_NAME = 'products';
const DEFAULT_UNIT = 'gab.';

export class productsDAO {
    static async injectDB(conn: MongoClient): Promise<void> {
        if (products) { return; }
        try {
            products = conn.db(process.env.DB_BASE as string)
                .collection(PRODUCTS_COLLECTION_NAME);
            await productsDAO.updateDb()
                .then(_ => productsDAO.createIndexes());
        } catch (err) {
            Logger.error('Customers DAO', err);
            return;
        }
    }

    static async insertNewProduct(prod: ProductNoId): Promise<string | null> {
        return products.insertOne(prod)
        .then(result=> products.findOne({_id: result.insertedId}) )
        .then(result=> result?.name || null)
    }

    static async insertNewProducts(prod: ProductNoPrices[]): Promise<ProductResult> {
        if (!(prod && prod.length)) { return { error: null, insertedCount: 0 }; }
        return products.insertMany(prod)
            .then(result => ({
                insertedCount: result.insertedCount,
                error: !result.result.ok,
            }))
            .catch(error => ({ error }));
    }

    static async getProducts(category?: string): Promise<ProductResult> {
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
        const result = products.find(filter)
            .project(projection)
            .sort({ name: 1 })
            .toArray();
        return {
            data: await result,
            error: false,
        };
    }

    // Done!
    static async getProduct(name: string): Promise<Product | null> {
        return products.findOne({ name });
    }

    static async getCustomerProducts(customerName: string): Promise<ProductResult> {
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
            const customerProducts = await products.aggregate<CustomerProduct>(allProductsPipeline).toArray();
            return {
                customerProducts,
                error: false,
            };
        } catch (error) { return { error }; }
    }

    static async deleteProduct(name: string): Promise<ProductResult> {
        const result = await products.deleteOne({ name });
        return {
            deletedCount: result.deletedCount,
            error: !result.result.ok,
        };
    }

    static async updateProduct(name: string, prod: ProductNoId): Promise<ProductResult> {
        const result = await products.updateOne({ name }, { $set: prod });
        return {
            modifiedCount: result.modifiedCount,
            error: !result.result.ok,
        };
    }

    static async productPrices(name: string): Promise<ProductResult> {
        const result = await products.findOne({ name }, { projection: { prices: 1 } });
        return {
            error: !result,
            prices: result ? result.prices : [],
        };
    }

    static async touchProduct(customer: string, data: string[]): Promise<ProductResult> {
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
            const resp = await products.updateMany(filter, update, { w: 0 });
            return {
                error: false,
            };
        } catch (error) { return { error }; }
    }

    static async updatePrice(name: string, customer: string, price: number): Promise<ProductResult> {
        const result = await products.updateOne(
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

    static async addPrice(name: string, customerName: string, price: number): Promise<ProductResult> {
        const result = await products.updateOne(
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

    static async addPrices(prices: ProductPriceImport[]): Promise<ProductResult> {
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
        return products.bulkWrite(update)
            .then(result => ({
                error: !result.result,
                insertedCount: result.modifiedCount,
            }))
            .catch(error => ({ error }));
    }

    static async deletePrice(name: string, customerName: string): Promise<ProductResult> {
        const result = await products.updateOne(
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

    // Done!
    static async validate(property: keyof Product): Promise<ProductResult> {
        const result = (await products.find({}).project({ _id: 0, [property]: 1 }).toArray())
            .map((doc: Partial<Product>) => doc[property]);
        return {
            validatorData: result,
            error: null,
        };
    }

    static async getCustomersProducts(
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
            const result = await products.aggregate(aggr).toArray();
            return {
                data: result,
                error: null,
            };
        } catch (error) { return { error }; }
    }

    private static createIndexes(): Promise<any> {
        return products.createIndexes([
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

    private static async updateDb(): Promise<void> {
        return products.updateMany({ units: { $exists: false } }, { $set: { units: DEFAULT_UNIT } })
            .then(result => {
                if (result.modifiedCount > 0) {
                    Logger.info(`Products Collection updated. ${result.modifiedCount} records set units to '${DEFAULT_UNIT}'`);
                }
                return;
            });
    }
}