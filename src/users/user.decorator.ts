import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from './user.interface';

export const Usr = createParamDecorator<(keyof User)>(
    (key, ctx: ExecutionContext) => {
        const request: Request = ctx.switchToHttp().getRequest();
        const user = request.session.user;
        if (!user) {
            throw new Error('Ivalid key');
        }
        return key ? user[key] : user;
    }
);
