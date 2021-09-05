import {
  Controller,
  ClassMiddleware,
  Post,
  ClassWrapper,
  Get,
  Delete,
  Put,
  ClassErrorMiddleware,
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { Customer } from '../interfaces';
import { CustomersDao, XmfSearchDao } from '../dao';
import { logError } from '../lib/errorMiddleware';

@Controller('data/customers')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
  Preferences.getUserPreferences,
  PrdSession.validateSession,
  PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class CustomersController {
  constructor(
    private customersDao: CustomersDao,
    private xmfDao: XmfSearchDao,
  ) {}

  @Get('')
  private async getCustomers(req: Request, res: Response) {
    res.json({
      data: await this.customersDao.getCustomers(Boolean(req.query.disabled)),
      error: false,
    });
  }

  @Put()
  private async newCustomer(req: Request, res: Response) {
    if (!req.body || !req.body['CustomerName']) {
      res.status(404).json();
      return;
    }
    const customer: Customer = req.body;
    const result = await this.customersDao.insertCustomer(customer);
    res.json(result);
  }

  @Post(':id')
  private async updateCustomer(req: Request, res: Response) {
    const _id = new ObjectId(req.params.id);
    delete req.body._id;
    const result = await this.customersDao.updateCustomer(
      _id,
      req.body as Partial<Customer>,
    );
    res.json(result);
  }

  @Delete(':id')
  private async deleteCustomer(req: Request, res: Response) {
    const id: string | undefined = req.params.id;
    if (!id) {
      res.status(404).json();
      return;
    }
    res.json({
      result: await this.customersDao.deleteCustomer(id),
      error: false,
    });
  }

  @Put('update-from-xmf')
  private async updateFromXnf(req: Request, res: Response) {
    res.json(await this.xmfDao.customersToCustomersDb('customers'));
  }

  @Get('validate/:property')
  private async validate(req: Request, res: Response) {
    const property: keyof Customer = req.params.property as keyof Customer;
    res.json(await this.customersDao.validate(property));
  }

  // id - either _id or CustomerName
  @Get(':id')
  private async getById(req: Request, res: Response) {
    const idOrName = req.params.id;

    res.json({
      error: false,
      data: await this.customersDao.getCustomer(idOrName),
    });
  }
}
