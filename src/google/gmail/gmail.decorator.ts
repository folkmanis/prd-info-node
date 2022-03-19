import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entities/users/entities/user.interface';
import { Request } from 'express';
import { google } from 'googleapis';


export const Gmail = createParamDecorator<keyof User>(
    (key, ctx: ExecutionContext) => {
        const request: Request = ctx.switchToHttp().getRequest();
        const { oAuth2 } = request;
        if (oAuth2) {
            const gmail = google.gmail({
                version: 'v1',
                auth: oAuth2,
            });

            return gmail;
        }
    },
);
