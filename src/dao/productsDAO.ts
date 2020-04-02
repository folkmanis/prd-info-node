import { MongoClient, Collection, ObjectId, DeleteWriteOpResultObject, FilterQuery, Double } from "mongodb";
import Logger from '../lib/logger';
import { Product, ProductResult, ProductNoId, ProductNoPrices, ProductCategories } from '../lib/products-interface';

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

    static async getProducts(category?: ProductCategories): Promise<ProductResult> {
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
            .sort({ category: 1, name: 1 })
            .toArray();
        return {
            products: await result,
            error: false,
        };
    }

    static async getProduct(id: ObjectId): Promise<ProductResult> {
        const product = await products.findOne({ _id: id });
        return {
            product: product || undefined,
            error: !product
        };
    }

    static async deleteProduct(id: ObjectId): Promise<ProductResult> {
        const result = await products.deleteOne({ _id: id });
        return {
            deletedCount: result.deletedCount,
            error: !result.result.ok,
        };
    }

    static async updateProduct(id: ObjectId, prod: ProductNoPrices): Promise<ProductResult> {
        const result = await products.updateOne({ _id: id }, { $set: prod });
        return {
            modifiedCount: result.modifiedCount,
            error: !result.result.ok,
        }
    }

    static async validate(prod: Partial<Product>): Promise<boolean> {
        return !(await products.findOne(prod));
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