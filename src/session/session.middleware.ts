import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import { MongoClient } from 'mongodb';

@Injectable()
export class SessionMiddleware implements NestMiddleware {

  use;

  constructor(
    private config: ConfigService,
    @Inject('MONGO_CLIENT') private connection: MongoClient,
  ) {
    this.use = session({
      secret: 'HGG50EtOT7',
      store: MongoStore.create({
        client: this.connection,
        stringify: false,
      }) as unknown as session.Store,
      cookie: {
        maxAge: this.config.get('SESSION_EXPIRES') * 1000,
        httpOnly: true,
        sameSite: 'lax',
      },
      saveUninitialized: false,
      unset: 'destroy',
      resave: false,
      rolling: true,
    });

  }

}
