import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { productsDAO } from '../dao/productsDAO';
import { Product, ProductNoId } from '../interfaces';
import { omit } from 'lodash';


@Controller('data/products')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)

export class ProductsController {
    @Get('prices/customer/:customer')
    private async getCustomerPrices(req: Request, res: Response) {
        res.json(
            await productsDAO.getCustomerProducts(req.params.customer)
        );
    }

    @Get('category/:name')
    private async getByCategory(req: Request, res: Response) {
        const category = <string | undefined>req.params.name;
        if (!category) {
            res.status(404).json({ error: 'invalid request' });
        } else {
            res.json(
                await productsDAO.getProducts(category)
            );
        }
    }

    @Get('prices/customers')
    private async getPricesCustomers(req: Request, res: Response) {
        const filter = JSON.parse(req.query.filter as string) as {
            customerName: string;
            product: string;
        }[];
        res.json(await productsDAO.getCustomersProducts(filter));
    }

    @Get('validate/:property')
    private async validate(req: Request, res: Response) {
        const property: keyof Product = req.params.property as keyof Product;
        res.json(await productsDAO.validate(property));
    }

    @Get(':name/prices')
    private async getProductPrices(req: Request, res: Response) {
        const name = req.params.name;
        res.json(await productsDAO.productPrices(name));
    }

    @Get(':name')
    private async getProduct(req: Request, res: Response) {
        const name = req.params.name;
        res.json({
            error: false,
            data: await productsDAO.getProduct(name)

        });
    }

    @Get('')
    private async getAllProducts(req: Request, res: Response) {
        res.json(
            await productsDAO.getProducts()
        );
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Put(':name/price/:customer')
    private async addCustomerPrice(req: Request, res: Response) {
        const name = req.params.name;
        const customer = <string>req.params.customer;
        const price: number = req.body.price;
        if (price !== +price) { throw new Error('nuber required'); }
        res.json(await productsDAO.addPrice(name, customer, +price));
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Put('')
    private async newProduct(req: Request, res: Response) {
        const prod = <ProductNoId | undefined>req.body;
        if (!prod?.name || !prod.category) {
            throw new Error('no data');
        }

        const insertedId = await productsDAO.insertNewProduct(prod);
        if (!insertedId) { throw `Insert failed ${JSON.stringify(prod)}`; }
        req.log.info('product inserted', prod);
        res.json({
            error: false,
            insertedId
        });
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':name/price/:customer')
    private async setCustomerPrice(req: Request, res: Response) {
        const name = req.params.name;
        const customer = <string>req.params.customer;
        const price: number = req.body.price;
        if (price !== +price) { throw new Error('nuber required'); }
        res.json(await productsDAO.updatePrice(name, customer, +price));
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':name/prices')
    private async updatePrices(req: Request, res: Response) {
        const name = req.params.name;
        const product: Pick<Product, 'prices'> = { prices: req.body };
        res.json({ name, product });
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':name')
    private async updateProduct(req: Request, res: Response) {
        const name = req.params.name;
        const product: ProductNoId = omit(<Product>req.body, ['_id']);
        const result = await productsDAO.updateProduct(name, product);
        res.json(result);
        req.log.info('product updated', result);
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Delete(':name/price/:customer')
    private async deleteCustomerPrice(req: Request, res: Response) {
        const name = req.params.name;
        const customer = <string>req.params.customer;
        res.json(await productsDAO.deletePrice(name, customer));
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Delete(':name')
    private async deleteProducts(req: Request, res: Response) {
        const name = req.params.name;
        const result = await productsDAO.deleteProduct(name);
        res.json(result);
        req.log.info('product delete', result);
    }
}