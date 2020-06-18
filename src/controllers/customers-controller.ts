
import { Controller, ClassMiddleware, Post, ClassWrapper, Get, Delete, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { customersDAO } from '../dao/customersDAO';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';
import { Customer } from '../interfaces';

@Controller('data/customers')
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class CustomersController {
    @Get('')
    private async getCustomers(req: Request, res: Response) {
        req.log.debug('customers list requested');
        res.json({
            data: await customersDAO.getCustomers(Boolean(req.query.disabled)),
            error: null,
        });
    }

    @Put()
    private async newCustomer(req: Request, res: Response) {
        if (!req.body || !req.body['CustomerName']) {
            res.status(404).json();
            return;
        }
        const customer: Customer = req.body;
        const result = await customersDAO.insertCustomer(customer);
        res.json(result);
    }

    @Post(':id')
    private async updateCustomer(req: Request, res: Response) {
        const _id = new ObjectId(req.params.id);
        delete req.body._id;
        const result = await customersDAO.updateCustomer(_id, req.body as Partial<Customer>);
        res.json(result);
    }

    @Delete(':id')
    private async deleteCustomer(req: Request, res: Response) {
        const id: string | undefined = req.params.id;
        if (!id) {
            res.status(404).json();
            return;
        }
        res.json(
            {
                result: await customersDAO.deleteCustomer(id),
                error: null,
            }
        );
    }

    @Put('update-from-xmf')
    private async updateFromXnf(req: Request, res: Response) {
        res.json(
            await xmfSearchDAO.customersToCustomersDb('customers')
        );
    }

    @Get('validate/:property')
    private async validate(req: Request, res: Response) {
        const property: keyof Customer = req.params.property as keyof Customer;
        res.json(await customersDAO.validate(property));
    }

    @Get(':id')
    private async getById(req: Request, res: Response) {
        const id: string | undefined = req.params.id;
        if (!id) {
            res.status(404).json();
            return;
        }
        res.json(
            {
                data: await customersDAO.getCustomerById(id),
                error: null
            }
        );
    }

}