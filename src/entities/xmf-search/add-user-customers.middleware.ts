import { Injectable, NestMiddleware } from '@nestjs/common';
import { PreferencesService } from '../../preferences';
import { Request, Response } from 'express';

@Injectable()
export class AddUserCustomersMiddleware implements NestMiddleware {
  constructor(private readonly prefService: PreferencesService) {}

  async use(req: Request, res: Response, next: () => void) {
    const user = req.session?.user;

    if (user) {
      const { customers } = await this.prefService.getUserPreferences(
        user.username,
      );
      req.query.customers = customers;
    }

    next();
  }
}
