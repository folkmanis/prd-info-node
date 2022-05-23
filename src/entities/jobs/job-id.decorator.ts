import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const JobId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const value = ctx.switchToHttp().getRequest().params.jobId;
    return parseInt(value, 10);
  },
);
