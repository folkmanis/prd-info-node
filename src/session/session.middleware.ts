import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MongoStore from 'connect-mongo';
import session from 'express-session';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use = session({
    secret: 'HGG50EtOT7',
    store: MongoStore.create({
      mongoUrl: this.config.get('DB_SRV'),
      stringify: false,
    }),
    cookie: {
      maxAge: this.config.get('SESSION_EXPIRES')! * 1000,
      httpOnly: true,
      sameSite: true,
    },
    saveUninitialized: false,
    unset: 'destroy',
    resave: false,
    rolling: true,
  });

  constructor(private config: ConfigService) {}
}
