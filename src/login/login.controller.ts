import { UseInterceptors, Controller, Delete, Get, Post, Req, Session, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import * as session from 'express-session';
import { User } from '../entities/users';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PublicRoute } from './public-route.decorator';
import { Usr } from '../session';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor';

@Controller('login')
export class LoginController {
  @UseGuards(LocalAuthGuard)
  @PublicRoute()
  @Post()
  async login(
    @Req() req: Request
  ) {
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
  async logout(
    @Session() sess: session.Session
  ) {
    await new Promise(resolve => sess.destroy(resolve));
    return 'logged out';
  }

  @Get()
  @PublicRoute()
  user(
    @Usr() user: User | undefined
  ) {
    return user || {};
  }
}
