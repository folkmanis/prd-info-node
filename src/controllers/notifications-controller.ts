import { ClassErrorMiddleware, ClassMiddleware, ClassWrapper, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { NotificationsDao } from '../dao';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

@Controller('data/notifications')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
])
@ClassWrapper(asyncWrapper)
export class NotificationsController {

    constructor(
        private notificationsDao: NotificationsDao,
    ) { }

    @Get('')
    async getMessages(req: Request, res: Response) {
        const fromDate: Date = req.query.from ? new Date(+req.query.from) : new Date();
        const toDate: Date = new Date();
        const modules: string[] = (req.query.modules as string)?.split(',') || [];
        res.json({
            error: false,
            timestamp: toDate,
            data: await this.notificationsDao.getAll(fromDate, toDate, modules),
        });
    }


}