import { createZodDto } from 'nestjs-zod';
import { preferencesObjectToDbArray } from '../interfaces/system-preferences.interface.js';

export class PreferencesDto extends createZodDto(preferencesObjectToDbArray, {
  codec: true,
}) {}
