import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PreferencesModuleNamesSchema } from '../interfaces/system-preferences.interface.js';

export class ModuleNameDto extends createZodDto(
  z.object({
    module: PreferencesModuleNamesSchema,
  }),
) {}
