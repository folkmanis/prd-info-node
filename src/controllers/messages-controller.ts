import { Controller, ClassMiddleware, Post, ClassWrapper, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { Customer, Modules, MODULES } from '../interfaces';
import { MessagesDao } from '../dao';
import { logError } from '../lib/errorMiddleware';

@Controller('data/messages')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
])
@ClassWrapper(asyncWrapper)
export class MessagesController {

    constructor(
        private messagesDao: MessagesDao,
    ) { }

    @Get('')
    async getMessages(req: Request, res: Response) {
        const fromDate: Date = new Date(+(req.query.from as string) || Date.now());
        const modules: Modules[] | undefined = (req.query.modules as string | undefined)?.split(',')
            .filter(m => MODULES.includes(m as Modules)) as Modules[];
        res.json({
            error: false,
            data: await this.messagesDao.getMessages(fromDate, modules),
            timestamp: fromDate,
        });
    }

}