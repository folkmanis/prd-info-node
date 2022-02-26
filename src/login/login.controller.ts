import {
  UseInterceptors,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import * as session from 'express-session';
import { User } from '../entities/users';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PublicRoute } from './public-route.decorator';
import { Usr } from '../session';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor';
import { SessionTokenService } from '../session/session-token';
import { Session as Sess } from 'express-session';
import { InstanceId } from '../preferences/instance-id.decorator';


@Controller('login')
export class LoginController {

  constructor(
    private readonly tokenService: SessionTokenService,
  ) { }

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
  async logout(@Session() sess: session.Session) {
    await new Promise((resolve) => sess.destroy(resolve));
    return 'logged out';
  }

  @Get('session-token')
  @UseInterceptors(new ResponseWrapperInterceptor('data'))
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
  @PublicRoute()
  user(@Usr() user: User | undefined) {
    return user || {};
  }
}
