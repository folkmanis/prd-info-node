import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const JobId = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const paramName = data ?? 'jobId';
    const value = ctx.switchToHttp().getRequest().params[paramName];
    return parseInt(value, 10);
  },
);
