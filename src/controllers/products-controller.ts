/*
    @Get('id/:id')
    {
        error
        product: Product
    }

    @Get('category/:name')
    {
        error
        products: Product[]
    }

    @Post('update')
        Partial<Product>
    { error }

    @Put('new')
        Partial<Product>
    { error }
*/

import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { productsDAO } from '../dao/productsDAO';
import { Product, ProductNoId, ProductCategories, ProductNoPrices } from '../lib/products-interface';
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
    @Get('category/:name')
    private async getByCategory(req: Request, res: Response) {
        const category = <ProductCategories | undefined>req.params.name;
        if (!category) {
            res.status(404).json({ error: 'invalid request' });
        } else {
            res.json(
                await productsDAO.getProducts(category)
            );
        }
    }

    @Get('categories')
    private async getCategories(req: Request, res: Response) {
        // TODO
        res.json();
    }

    @Get('validate')
    private async validate(req: Request, res: Response) {
        console.log(req.query)
        res.json(await productsDAO.validate(req.query));
    }

    @Get(':id/prices')
    private async getProductPrices(req: Request, res: Response) {
        // TODO
        res.json();
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
    @Post(':id')
    private async updateProduct(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const product: ProductNoPrices = omit(<Product>req.body, ['_id', 'prices']);
        const result = await productsDAO.updateProduct(id, product);
        res.json(result);
        req.log.info('product updated', result);
    }

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post(':id/prices')
    private async updatePrices(req: Request, res: Response) {
        res.json();
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