import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export const JobId = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        return ctx.switchToHttp().getRequest().params.jobId;
    }
);
