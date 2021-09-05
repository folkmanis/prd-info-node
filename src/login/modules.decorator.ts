import { SetMetadata } from '@nestjs/common';
import { SystemModules } from '../preferences';

export const Modules = (...args: SystemModules[]) =>
  SetMetadata('modules', args);
