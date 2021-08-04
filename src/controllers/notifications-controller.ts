import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Preferences } from '../lib/preferences-handler';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { NotificationsDao } from '../dao';
import { NotificationBase, Modules } from '../interfaces';

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
        const fromDate: Date = new Date(+(req.query.from as string) ?? Date.now());
        const toDate: Date = new Date();
        const modules: string[] = (req.query.modules as string)?.split(',') || [];
        res.json({
            error: false,
            timestamp: toDate,
            data: await this.notificationsDao.getAll(fromDate, toDate, modules),
        });
    }


}