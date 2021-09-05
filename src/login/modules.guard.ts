import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { SystemModules } from '../preferences';
import { intersection } from 'lodash';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const modules = this.reflector.get<SystemModules[]>(
      'modules',
      context.getHandler(),
    );
    if (!modules || modules.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const userModules = request.session?.user?.preferences.modules || [];

    return intersection(modules, userModules).length === modules.length;
  }
}
