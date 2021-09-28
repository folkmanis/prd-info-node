import { SetMetadata, createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { XmfJobsFilter } from './dto/xmf-jobs-filter';
import { plainToClass } from 'class-transformer';

export const QueryFilter = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req: Request = ctx.switchToHttp().getRequest();
        const value = req.query.query as string;
        try {
            const filter = value ? JSON.parse(value) : {};
            return plainToClass(
                XmfJobsFilter,
                {
                    ...filter,
                    customers: req.query.customers,
                },
            );
        } catch (error) {
            throw new BadRequestException(value);
        }
    }
);