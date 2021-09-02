import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionMiddleware implements NestMiddleware {

  private sessionStore = MongoStore.create({ mongoUrl: this.config.get('DB_SRV'), stringify: false });
  private maxAge: number = this.config.get('SESSION_EXPIRES')!;

  use = session({
    secret: 'HGG50EtOT7',
    store: this.sessionStore,
    cookie: {
      maxAge: this.maxAge,
      httpOnly: true,
      sameSite: true,
    },
    saveUninitialized: false,
    unset: 'destroy',
    resave: false,
    rolling: true,
  });

  constructor(
    private config: ConfigService,
  ) { }


}
