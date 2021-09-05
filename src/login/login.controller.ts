import {
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
import { User, Usr } from '../users';
import { LocalAuthGuard } from './local-auth.guard';
import { PublicRoute } from './public-route.decorator';

@Controller('login')
export class LoginController {
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
  async logout(@Session() sess: session.Session) {
    return new Promise((resolve) => sess.destroy(resolve)).then(
      () => 'logged out',
    );
  }

  @Get()
  findAll(@Usr() user: User) {
    return user;
  }
}
