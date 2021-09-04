import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const InstanceId = createParamDecorator(
    (key: any, ctx: ExecutionContext) => {
        const req: Request = ctx.switchToHttp().getRequest();
        return req.instanceId;
    }
);