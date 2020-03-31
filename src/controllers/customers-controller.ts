/*
GET 
{}
customers: [Pick<Customer, '_id' & 'CustomerName', 'code'>] - visu klientu CustomerName lauki

GET :id
id: string - lietotāja _id
customer: {Customer}

PUT new
{Customer} - jaunais lietotājs
    "result": {
        "n": 1,
        "ok": 1
    },

POST update
{Customer} - lietotājs
    "result": {
        "n": 1,
        "ok": 1
    },

PUT update-from-xmf
imports no xmf arhīva datubāzes uz customers
{}

DELETE by-id
id: string
    "result": {
        "n": 1,
        "ok": 1
    },

GET validate
Partial<Customer>
{boolean}
*/

import { Controller, ClassMiddleware, Post, ClassWrapper, Get, Delete, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { customersDAO } from '../dao/customersDAO';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';
import { Customer } from '../lib/customers-interface';

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
            customers: await customersDAO.getCustomers(),
            error: null,
        });
    }

    @Put('new')
    private async newUser(req: Request, res: Response) {
        if (!req.body || !req.body['CustomerName']) {
            res.status(404).json();
            return;
        }
        const customer: Customer = req.body;
        const result = await customersDAO.insertCustomer(customer);
        res.json({
            insertedId: result.insertedId || null,
            result: result.result,
            error: !result.result.ok,
        });
    }

    @Post('update')
    private async updateUser(req: Request, res: Response) {
        if (!req.body || (!req.body._id && !req.body['CustomerName'])) {
            res.status(404).json();
            return;
        }
        const customer: Customer = { ...req.body, _id: new ObjectId(req.body._id) };
        const result = await customersDAO.updateCustomer(customer);
        res.json({
            result,
            error: !result.ok,
        });
    }

    @Delete(':id')
    private async deleteUser(req: Request, res: Response) {
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

    @Get('validate')
    private async validate(req: Request, res: Response) {
        const keys = Object.keys(req.query);
        if (keys.length === 0) {
            res.json(false);
            return;
        }
        if (keys.length === 1) {
            res.json(
                !(await customersDAO.findOneCustomer(req.query))
            );
            return;
        }
        const filter = { $or: keys.map(key => ({ [key]: req.query[key] })) };
        res.json(
            !(await customersDAO.findOneCustomer(filter))
        );

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
                customer: await customersDAO.getCustomerById(id),
                error: null
            }
        );
    }

}