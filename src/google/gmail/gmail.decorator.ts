import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Gmail = createParamDecorator(
  (key, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.gmail;
  },
);
