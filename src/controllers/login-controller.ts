import { ClassErrorMiddleware, ClassWrapper, Controller, Get, Post, Middleware, Delete } from '@overnightjs/core';
import crypto from 'crypto';
import { Request, Response } from 'express';
import session from 'express-session';
import { asyncWrapper } from '../lib/asyncWrapper';
import { MessagesDao, UsersDao } from '../dao';
import { Login, LoginResponse, Modules, SystemNotification } from '../interfaces';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';
import { ObjectId } from 'mongodb';

@ClassErrorMiddleware(logError)
@Controller('data/login')
@ClassWrapper(asyncWrapper)
export class LoginController {

    constructor(
        private usersDao: UsersDao,
        private messagesDao: MessagesDao,
    ) { }

    @Post('')
    async login(req: Request, res: Response) {
        if (!req.body.username || !req.body.password) {  // Ja tukšs pieprasījums
            if (req.session && req.session.user) {
                req.log.info('User logged out', { user: req.session.user });
                res.json(
                    await this.logout(req.session)
                );
            } else {
                res.json({ error: undefined });
            }
            return;
        }
        if (req.session) { // Ja ir sesija, tad izdzēš
            await new Promise<void>((resolve, reject) => {
                req.session?.regenerate((err) => {  // Sesijas dzēšana
                    err ? reject(err) : resolve();
                });
            });
        }

        const login: Login = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
            // userDisabled: false,
        };

        const loginResponse = await this.usersDao.login(login);

        if (loginResponse.data) {
            req.log.info('User logged in', { user: loginResponse.data });
        } else {
            req.log.error('Login failed', req.body);
        }
        if (req.session && loginResponse.data) {
            req.session.user = loginResponse.data;
        }
        res.json(loginResponse);
    }

    async logout(session: session.Session): Promise<LoginResponse> {
        return new Promise<LoginResponse>((resolve, reject) => {
            session.destroy((err) => {
                if (err) {
                    reject({ error: err });
                } else {
                    resolve({
                        error: null,
                        modifiedCount: 1,
                        data: undefined,
                    });
                }
            });
        });
    }

    @Middleware([
        Preferences.getUserPreferences,
        PrdSession.validateSession,
    ])
    @Get('messages')
    async getMessages(req: Request, res: Response) {
        const fromDate: Date = new Date(+(req.query.from as string) || 0);
        const toDate: Date = new Date();
        const modules: Modules[] = req.userPreferences?.modules || [];
        res.json({
            error: false,
            timestamp: toDate,
            data: await this.messagesDao.getMessages(fromDate, toDate, modules, req.session.user?.username || ''),
        });
    }

    @Middleware([
        Preferences.getUserPreferences,
        PrdSession.validateSession,
    ])
    @Post('messages/allRead')
    async allMessagesRead(req: Request, res: Response) {

        const username = req.session.user!.username;
        const modifiedCount = await this.messagesDao.markAs('seenBy', username);
        res.json({
            error: false,
            modifiedCount,
        });

        if (modifiedCount > 0) {
            res.notification = new SystemNotification({ operation: 'messages' });
        }


    }

    @Middleware([
        Preferences.getUserPreferences,
        PrdSession.validateSession,
    ])
    @Delete('messages/:id')
    async deleteMessage(req: Request, res: Response) {
        const filter = { _id: new ObjectId(req.params.id) };
        const user = req.session.user!;
        const deletedCount = await this.messagesDao.markAs('deletedBy', user.username, filter);

        res.json({
            error: false,
            deletedCount,
        });

        if (deletedCount > 0) {
            res.notification = new SystemNotification({ operation: 'messages' });
        }
    }

    @Get('')
    private user(req: Request, res: Response) {
        if (req.session && req.session.user) {
            res.json({
                error: null,
                data: req.session.user
            });
        }
        else {
            res.json({
                error: 'Not logged in'
            });
        }
    }


}
