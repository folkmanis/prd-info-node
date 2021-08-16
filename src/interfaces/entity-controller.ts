import { ClassErrorMiddleware, ClassWrapper, Controller, Delete, Get, Post, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { EntityDao } from './entityDao.interface';

@Controller('')
@ClassErrorMiddleware(logError)
@ClassWrapper(asyncWrapper)
export class EntityController<
    P,
    T extends Express.JsonResponse<P> = Express.JsonResponse<P>,
    U extends { _id: any; } = P & { _id: any; },
    > {

    dao!: EntityDao<U>;

    @Put()
    async put(req: Request, res: Response<T>) {
        const entity = req.body as U;
        const { insertedId } = await this.dao.addOne(entity);
        res.jsonOk({
            insertedId,
        });
    }

    @Post(':id')
    async post(req: Request, res: Response<T>) {
        const id: string = req.params.id;
        const entity = req.body as Partial<U>;
        delete entity._id;
        const { modifiedCount } = await this.dao.updateOne(id, entity);
        res.jsonOk({
            modifiedCount,
        });
    }

    @Delete(':id')
    async delete(req: Request, res: Response<T>) {
        const id: string = req.params.id;
        const { deletedCount } = await this.dao.deleteOneById(id);
        res.jsonOk({
            deletedCount,
        });
    }

    @Get('validate/:property')
    async getProperty(req: Request, res: Response<T>) {
        const property = req.params.property as keyof U;
        res.jsonOk({
            validatorData: await this.dao.validationData(property),
        });
    }

    @Get(':id') // (^[0-9a-fA-F]{24}$)
    async getMaterial(req: Request, res: Response<T>) {
        const id: string = req.params.id;
        res.jsonOk({
            data: await this.dao.getById(id),
        });
    }

    @Get('')
    async getMaterials<K extends keyof U>(req: Request, res: Response<T>) {
        const filter = req.query as unknown as { [key in K]: U[K] };
        res.jsonOk({
            data: await this.dao.getArray(filter),
        });
    }

}

