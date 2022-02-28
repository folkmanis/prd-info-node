import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import { MongoClient } from 'mongodb';



@Injectable()
export class SessionMiddleware implements NestMiddleware {

  constructor(
    private config: ConfigService,
    @Inject('MONGO_CLIENT') private connection: MongoClient,
  ) { }

  use = session({
    secret: 'HGG50EtOT7',
    store: MongoStore.create({
      client: this.connection,
      stringify: false,
    }),
    cookie: {
      maxAge: this.config.get('SESSION_EXPIRES') * 1000,
      httpOnly: true,
      sameSite: true,
    },
    saveUninitialized: false,
    unset: 'destroy',
    resave: false,
    rolling: true,
  });


}
