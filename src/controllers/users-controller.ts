/**
 * Users administration
 *
 * GET /list
 * Full list of users
 * count: number total count
 * users: {id, username, name, admin, last_login}[]
 * 
 * POST /user
 * Update/insert user
 *  {
 *   username: string,
 *   name: string,
 *   password: string,
 *   admin: boolean,
 *   last_login: Date,
 *  }
 */

import crypto from 'crypto';
import { Connection, Model } from "mongoose";
import { Controller, Get, Post, Wrapper, ClassWrapper, ClassMiddleware } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncWrapper } from "../lib/asyncWrapper";
import { User, UserSchema } from '../lib/user-class';
import { PrdSession } from '../lib/session-handler';


@Controller('data/users')
@ClassMiddleware(PrdSession.validateAdminSession)
@ClassWrapper(asyncWrapper)
export class UsersController {

    @Get('list')
    private async getList(req: Request, res: Response) {
        Logger.Info('users/list');
        res.result = {};
        const User: Model<User> = req.mongo.model('users', UserSchema);
        res.result.count = await User.estimatedDocumentCount();
        res.result.users = await User.find({}, '-_id username name admin last_login');
        res.json(res.result);
    }

    @Post('user')
    private async postUser(req: Request, res: Response) {
        Logger.Info('users/update');
        const user: User = req.body;
        const mongo: Connection = req.mongo;
        const userModel = mongo.model('users', UserSchema);
        user.password = crypto.createHash('sha256').update(req.body.password).digest('hex');
        
        const result = await userModel.updateOne({username: user.username}, user, {upsert: true});
        console.log(result);
        res.json(result);
    }

}
