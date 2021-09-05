import {
  ChildControllers,
  ClassErrorMiddleware,
  ClassMiddleware,
  ClassWrapper,
  Controller,
} from '@overnightjs/core';
import { ProductionStagesDao } from '../dao';
import { EntityController } from '../interfaces';
import { ProductionStage } from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

const controller = new EntityController<ProductionStage>();

@Controller('data/production-stages')
@ChildControllers([controller])
@ClassErrorMiddleware(logError)
@ClassMiddleware([
  Preferences.getUserPreferences,
  PrdSession.validateSession,
  PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class ProductionStagesController {
  constructor(private dao: ProductionStagesDao) {
    controller.dao = this.dao;
  }
}
