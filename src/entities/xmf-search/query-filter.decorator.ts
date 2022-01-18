import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import { XmfJobsFilter } from './dto/xmf-jobs-filter';

export const QueryFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const value = req.query.query as string;
    try {
      const filter = value ? JSON.parse(value) : {};
      const customers = req.session.user.preferences.customers;
      return plainToClass(XmfJobsFilter, {
        ...filter,
        customers,
      });
    } catch (error) {
      throw new BadRequestException(value);
    }
  },
);
