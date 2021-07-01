import { ClassErrorMiddleware, ClassMiddleware, Controller, Delete, Get, Post, Put } from '@overnightjs/core';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { SessionsDao, UsersDao } from '../dao';
import { User, UsersResponse } from '../interfaces';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';

@Controller('data/users')
@ClassErrorMiddleware(logError)
@ClassMiddleware(PrdSession.validateAdminSession)
export class UsersController {

    constructor(
        private usersDao: UsersDao,
        private sessionsDao: SessionsDao,
    ) { }

    @Get(':id')
    private async getUser(req: Request, res: Response) {
        const username: string = req.params.id;
        req.log.info('get/user', { username });

        const result: UsersResponse = {
            error: false,
            data: await this.usersDao.getUser(username),
        };
        res.json(result);

    }

    @Get()
    private async getList(req: Request, res: Response) {
        req.log.info('users/list');
        const resp: UsersResponse = await this.usersDao.list().then(data => ({
            error: false,
            data,
        }));
        res.json(resp);
    }

    @Put()
    private async addUser(req: Request, res: Response) {
        const user: User = req.body;
        if (!user.username) { throw new Error('Username not provided'); }
        if (!user.password) { throw new Error('Password not provided'); }
        user.password = hashPassword(req.body.password);
        req.log.info('users add', req.body);

        const result = await this.usersDao.addUser(user);

        req.log.info('user added', result);
        res.json(result);
    }

    @Post(':id/password')
    private async updatePassword(req: Request, res: Response) {
        if (!req.body.password) { throw new Error('Password not set'); }

        const user = { username: req.params.id as string, password: hashPassword(req.body.password) };
        const result = await this.usersDao.updateUser(user);
        res.json(result);
        req.log.info('password updated', result);
    }

    @Post(':id')
    private async updateUser(req: Request, res: Response) {
        req.log.info('user update requested', req.body);
        const user: Partial<User> = { ...req.body, username: req.params.id };
        let deletedSessions = 0;
        if (user.sessions instanceof Array) {
            deletedSessions = await this.sessionsDao.deleteUserSessions(
                req.params.id,
                user.sessions.map(sess => sess._id)
            );
            delete user.sessions;
        }
        const modifiedCount = await this.usersDao.updateUser(user);
        req.log.info('user updated', modifiedCount);
        res.json({
            error: false,
            modifiedCount,
            deletedSessions,
        });
    }

    @Delete('session/:sessionId')
    private async deleteSession(req: Request, res: Response) {
        const sessionId = req.params.sessionId;

        res.json({
            error: false,
            deletedCount: await this.sessionsDao.deleteSession(sessionId),
        });
        req.log.info('session delete requested', sessionId);
    }

    @Delete(':id')
    private async deleteUser(req: Request, res: Response) {
        const username = req.params.id;
        const result = await this.usersDao.deleteUser(username);
        res.json(result);
        req.log.info('user delete', result);
    }

}

function hashPassword(passw: string): string {
    return crypto.createHash('sha256').update(passw).digest('hex');
}
