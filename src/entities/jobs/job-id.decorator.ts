import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const JobId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().params.jobId;
  },
);
