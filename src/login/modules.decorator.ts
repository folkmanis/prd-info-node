import { SetMetadata } from '@nestjs/common';
import { SystemModules } from '../preferences/index.js';

export const Modules = (...args: SystemModules[]) =>
  SetMetadata('modules', args);
