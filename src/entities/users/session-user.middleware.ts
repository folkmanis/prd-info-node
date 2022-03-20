import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class SessionUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const username = req.session.user?.username;
    if (username) {
      req.session.user =
        (await this.usersService.getSessionUser(username)) || undefined;
    }

    next();
  }
}
