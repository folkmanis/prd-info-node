import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject, FilterQuery, Double } from "mongodb";
import Logger from '../lib/logger';
import { Product, ProductResult, ProductNoId, CustomerProduct } from '../lib/products-interface';

let products: Collection<Product>;
let PRODUCTS_COLLECTION_NAME = 'products';

export class productsDAO {
    static async injectDB(conn: MongoClient): Promise<void> {
        if (products) { return; }
        try {
            products = conn.db(process.env.DB_BASE as string)
                .collection(PRODUCTS_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Customers DAO', err);
            return;
        }
        productsDAO.createIndexes();
    }

    static async insertNewProduct(prod: ProductNoId): Promise<ProductResult> {
        const result = await products.insertOne(prod);
        return { insertedId: result.insertedId, result: result.result, error: !result.result.ok };
    }

    // Done!
    static async getProducts(category?: string): Promise<ProductResult> {
        const filter: Partial<Product> = {};
        if (category) {
            filter.category = category;
        }
        const projection = {
            _id: 1,
            category: 1,
            name: 1,
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
    static async getProduct(id: ObjectId): Promise<ProductResult> {
        const product = await products.findOne({ _id: id });
        return {
            data: product || undefined,
            error: !product
        };
    }

    static async getCustomerProducts(customerName: string): Promise<ProductResult> {
        const pipeline = [{
            $unwind: {
                path: "$prices"
            }
        }, {
            $match: {
                "prices.customerName": customerName
            }
        }, {
            $sort: {
                name: 1
            }
        }, {
            $project: {
                _id: 0,
                productName: "$name",
                category: 1,
                description: 1,
                customerName: "$prices.customerName",
                price: "$prices.price"
            }
        }];
        const result = await products.aggregate<CustomerProduct>(pipeline).toArray();
        return {
            customerProducts: result,
            error: false,
        };
    }

    static async deleteProduct(id: ObjectId): Promise<ProductResult> {
        const result = await products.deleteOne({ _id: id });
        return {
            deletedCount: result.deletedCount,
            error: !result.result.ok,
        };
    }

    static async updateProduct(id: ObjectId, prod: ProductNoId): Promise<ProductResult> {
        const result = await products.updateOne({ _id: id }, { $set: prod });
        return {
            modifiedCount: result.modifiedCount,
            error: !result.result.ok,
        };
    }

    static async productPrices(id: ObjectId): Promise<ProductResult> {
        const result = await products.findOne({ _id: id }, { projection: { prices: 1 } });
        return {
            error: !result,
            prices: result ? result.prices : [],
        };
    }

    static async updatePrice(id: ObjectId, customer: string, price: number): Promise<ProductResult> {
        const result = await products.updateOne(
            { _id: id, "prices.customer": customer },
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

    static async addPrice(id: ObjectId, customerName: string, price: number): Promise<ProductResult> {
        const result = await products.updateOne(
            { _id: id },
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

    static async deletePrice(id: ObjectId, customerName: string): Promise<ProductResult> {
        const result = await products.updateOne(
            { _id: id },
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

    private static async createIndexes() {
        products.createIndexes([
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
}