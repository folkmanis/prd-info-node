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

    @Get(':id/prices')
    private async getProductPrices(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        res.json(await productsDAO.productPrices(id));
    }

    @Get(':id')
    private async getById(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        res.json(await productsDAO.getProduct(id));
    }

    @Get('')
    private async getAllProducts(req: Request, res: Response) {
        res.json(
            await productsDAO.getProducts()
        );
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Put(':id/price/:customer')
    private async addCustomerPrice(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const customer = <string>req.params.customer;
        const price: number = req.body.price;
        if (price !== +price) { throw new Error('nuber required'); }
        res.json(await productsDAO.addPrice(id, customer, +price));
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Put('')
    private async newProduct(req: Request, res: Response) {
        const prod = <ProductNoId | undefined>req.body;
        if (!prod?.name || !prod.category) {
            throw new Error('no data');
        } else if (prod.prices) {
            throw new Error('can not put prices');
        } else {
            const result = await productsDAO.insertNewProduct(prod);
            req.log.info('product inserted', result);
            res.json(result);
        }
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':id/price/:customer')
    private async setCustomerPrice(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const customer = <string>req.params.customer;
        const price: number = req.body.price;
        if (price !== +price) { throw new Error('nuber required'); }
        res.json(await productsDAO.updatePrice(id, customer, +price));
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':id/prices')
    private async updatePrices(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const product: Pick<Product, 'prices'> = { prices: req.body };
        res.json({ id, product });
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':id')
    private async updateProduct(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const product: ProductNoId = omit(<Product>req.body, ['_id']);
        const result = await productsDAO.updateProduct(id, product);
        res.json(result);
        req.log.info('product updated', result);
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Delete(':id/price/:customer')
    private async deleteCustomerPrice(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const customer = <string>req.params.customer;
        res.json(await productsDAO.deletePrice(id, customer));
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Delete(':id')
    private async deleteProducts(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const result = await productsDAO.deleteProduct(id);
        res.json(result);
        req.log.info('product delete', result);
    }
}