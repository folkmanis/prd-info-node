import { Query, Controller, Get, Redirect, Req, UseFilters, UseGuards, Session, Ip, ParseEnumPipe, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { Session as Sess, SessionData } from 'express-session';
import { PublicRoute } from '../public-route.decorator';
import { AllowNullResponse } from '../../lib/null-response.interceptor';
import { InvalidGoogleUserFilter, InvalidGoogleUserException } from './invalid-google-user.filter';
import { Oauth2Service } from '../../google/oauth2/oauth2.service';
import { LoginService } from '../../login/login.service';
import { UpdateUserDto, User, UsersService } from '../../entities/users';
import { UserUpdateNotifyInterceptor } from '../../entities/users';


@Controller('login/google')
export class GoogleController {

    constructor(
        private loginService: LoginService,
        private oauth2Service: Oauth2Service,
        private usersService: UsersService,
    ) { }


    @PublicRoute()
    @Get()
    @UseFilters(InvalidGoogleUserFilter)
    @Redirect()
    async googleLogin(
        @Session() session: Sess & SessionData,
        @Query('redirect') redirect: string = '/',
        @Query('scope') scope?: string,
    ) {

        const scopes = scope?.split(' ') || [];

        const url = await this.oauth2Service.getAuthUrl(session.id, scopes);

        session.redirectPath = redirect;

        return {
            url
        };
    }

    @PublicRoute()
    @Get('redirect')
    @UseFilters(InvalidGoogleUserFilter)
    @AllowNullResponse()
    @UseInterceptors(UserUpdateNotifyInterceptor)
    @Redirect('/')
    async googleRedirect(
        @Session() session: SessionData & Sess,
        @Ip() ip: string,
        @Query('state') state: string,
        @Query('code') code: string,
        @Query('error') error?: string,
    ) {

        if (error) {
            throw new InvalidGoogleUserException(error);
        }

        assertString(state);
        assertString(code, 'No response code from google received');

        const redirectPath = session.redirectPath;
        delete session.redirectPath;

        const tokens = await this.oauth2Service.getCredentials(code, state, session.id);
        const profile = await this.oauth2Service.getUserProfile(tokens);
        assertString(profile.id, 'User has no id');


        if (!session.user) {

            try {
                session.user = await this.loginService.validateGoogleId(profile.id);
            } catch (error) {
                throw new InvalidGoogleUserException(error);
            }

        }


        const userUpdate: UpdateUserDto = {
            google: profile,
        };
        if (tokens.refresh_token) {
            userUpdate.tokens = tokens;
        }
        if (profile.picture) {
            userUpdate.avatar = await this.oauth2Service.getUserPicture(profile.picture);
        }
        const user = await this.usersService.updateUser(session.user.username, userUpdate);

        if (!tokens.refresh_token) {
            tokens.refresh_token = user.tokens?.refresh_token;
        }
        session.tokens = tokens;

        session.lastSeen = {
            ip,
            date: new Date(),
        };

        if (typeof redirectPath === 'string') {
            return { url: redirectPath };
        }

    }




}

function assertString(value: unknown, message = 'Invalid params'): asserts value is string {
    if (typeof value !== 'string') throw new InvalidGoogleUserException(message);

}