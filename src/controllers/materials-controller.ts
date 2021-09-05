import {
  ChildControllers,
  ClassErrorMiddleware,
  ClassMiddleware,
  ClassWrapper,
  Controller,
} from '@overnightjs/core';
import { MaterialsDao } from '../dao';
import { EntityController } from '../interfaces';
import { Material } from '../interfaces/materials.interface';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

const controller = new EntityController<Material>();

@Controller('data/materials')
@ChildControllers([controller])
@ClassErrorMiddleware(logError)
@ClassMiddleware([
  Preferences.getUserPreferences,
  PrdSession.validateSession,
  PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class MaterialsController {
  constructor(private dao: MaterialsDao) {
    controller.dao = this.dao;
  }
}
