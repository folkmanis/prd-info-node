import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from './entities/user.interface';

export const Usr = createParamDecorator<keyof User>(
  (key, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.session?.user;
  },
);
