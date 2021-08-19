import { ChildControllers, ClassErrorMiddleware, ClassMiddleware, ClassWrapper, Controller } from '@overnightjs/core';
import { EquipmentDao } from '../dao';
import { EntityController } from '../interfaces';
import { Equipment } from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

const controller = new EntityController<Equipment>();

@Controller('data/equipment')
@ChildControllers([controller])
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class EquipmentController {

    constructor(
        private dao: EquipmentDao,
    ) {
        controller.dao = this.dao;
    }

}
