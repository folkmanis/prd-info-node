import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Preferences } from '../lib/preferences-handler';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { MaterialsDao } from '../dao';

@Controller('data/materials')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    PrdSession.validateSession,
])
@ClassWrapper(asyncWrapper)
export class MaterialsController {

    constructor(
        materialsDao: MaterialsDao,
    ) { }

}