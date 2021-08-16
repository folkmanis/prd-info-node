import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware, ChildControllers } from '@overnightjs/core';
import { Express, Request, Response } from 'express';
import { Preferences } from '../lib/preferences-handler';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { MaterialsDao } from '../dao';
import { Material } from '../interfaces/materials.interface';
import { EntityController } from '../interfaces';

const controller = new EntityController<Material>();

@Controller('data/materials')
@ChildControllers([controller])
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs-admin'),
])
@ClassWrapper(asyncWrapper)
export class MaterialsController {

    constructor(
        private dao: MaterialsDao,
    ) {
        controller.dao = this.dao;
    }

}