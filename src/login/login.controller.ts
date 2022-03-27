import {
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Session,
  UseGuards, UseInterceptors, Redirect, UseFilters
} from '@nestjs/common';
import { Request } from 'express';
import { Session as Sess, SessionData } from 'express-session';
import { User, UsersService } from '../entities/users';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor';
import { InstanceId } from '../preferences/instance-id.decorator';
import { Usr } from '../session';
import { SessionTokenService } from '../session/session-token';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PublicRoute } from './public-route.decorator';
import { UpdateSessionUserInterceptor } from '../session';
import { GoogleOauth2Guard } from './guards/google-oauth2.guard';
import { AllowNullResponse } from '../lib/null-response.interceptor';
import { InvalidGoogleUserFilter } from './filters/invalid-google-user.filter';


@Controller('login')
export class LoginController {

  constructor(
    private readonly tokenService: SessionTokenService,
  ) { }

  @PublicRoute()
  @UseGuards(GoogleOauth2Guard)
  @UseFilters(InvalidGoogleUserFilter)
  @Get('google')
  @Redirect()
  async googleLogin(
    @Req() req: Request,
  ) {
    return {
      url: req.session.oauth2?.url
    };
  }

  @PublicRoute()
  @UseGuards(GoogleOauth2Guard)
  @UseFilters(InvalidGoogleUserFilter)
  @Redirect('/')
  @Get('google/redirect')
  @AllowNullResponse()
  async googleRedirect(
    @Req() req: Request
  ) {
    if (req.session?.user) {
      req.session.lastSeen = {
        ip: req.ip,
        date: new Date(),
      };
    }
  }


  @UseGuards(LocalAuthGuard)
  @PublicRoute()
  @Post()
  async login(@Req() req: Request) {
    req.session.user = req.user as User;
    req.session.lastSeen = {
      ip: req.ip,
      date: new Date(),
    };
    return req.session.user;
  }

  @Delete()
  @PublicRoute()
  @UseInterceptors(new ResponseWrapperInterceptor('response'))
  async logout(@Session() sess: Sess) {
    await new Promise((resolve) => sess.destroy(resolve));
    return 'logged out';
  }

  @Get('session-token')
  @UseInterceptors(UpdateSessionUserInterceptor, new ResponseWrapperInterceptor('data'))
  generateToken(
    @Usr() user: User,
    @Session() session: Sess,
    @InstanceId() instanceId: string,
  ) {
    return this.tokenService.token(session, instanceId, user);
  }

  @Get('session-id')
  sessionId(@Session() session: Sess) {
    return {
      sessionId: session.id,
    };
  }

  @Get()
  @UseInterceptors(UpdateSessionUserInterceptor)
  async user(
    @Usr() user: User | undefined,
    @Session() session: SessionData,
  ) {
    return {
      ...user,
      isGmail: !!session.oauth2?.tokens
    };
  }

}
