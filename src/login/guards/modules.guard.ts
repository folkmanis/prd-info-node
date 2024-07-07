import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { SystemModules } from '../../preferences/index.js';
import { intersection } from 'lodash-es';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const modules = this.reflector.getAllAndOverride<SystemModules[]>(
      'modules',
      [context.getHandler(), context.getClass()],
    );
    if (!modules || modules.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const userModules = request.session?.user?.preferences.modules || [];

    return intersection(modules, userModules).length === modules.length;
  }
}
