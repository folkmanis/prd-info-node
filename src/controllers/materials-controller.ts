import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Preferences } from '../lib/preferences-handler';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { MaterialsDao } from '../dao';
import { Material } from '../interfaces/materials.interface';

@Controller('data/materials')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('calculations'),
])
@ClassWrapper(asyncWrapper)
export class MaterialsController {

    constructor(
        private materialsDao: MaterialsDao,
    ) { }

    @Put()
    async putMaterial(req: Request, res: Response) {
        const mat = req.body as Material;
        res.json({
            error: false,
            data: await this.materialsDao.addMaterial(mat)
        });
    }

    @Post(':id')
    async postMaterial(req: Request, res: Response) {
        const id: string = req.params.id;
        const mat = req.body as Partial<Material>;
        delete mat._id;
        const { modifiedCount } = await this.materialsDao.updateMaterial(id, mat);
        res.json({
            error: false,
            modifiedCount,
        });
    }

    @Delete(':id')
    async deleteMaterial(req: Request, res: Response) {
        const id: string = req.params.id;
        const { deletedCount } = await this.materialsDao.deleteMaterial(id);
        res.json({
            error: false,
            deletedCount,
        });
    }

    @Get('validate/:property')
    async getProperty(req: Request, res: Response) {
        const property = req.params.property as keyof Material;
        res.json({
            error: false,
            validatorData: await this.materialsDao.validationData(property),
        });
    }

    @Get(':id') // (^[0-9a-fA-F]{24}$)
    async getMaterial(req: Request, res: Response) {
        const id: string = req.params.id;
        res.json({
            error: false,
            data: await this.materialsDao.getMaterialById(id),
        });
    }

    @Get('')
    async getMaterials(req: Request, res: Response) {
        res.json({
            error: false,
            data: await this.materialsDao.getMaterials(req.query),
        });
    }

}