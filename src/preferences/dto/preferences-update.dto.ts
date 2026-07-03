import { createZodDto } from 'nestjs-zod';
import { preferencesObjectToDbArray } from '../interfaces/system-preferences.interface.js';

export class PreferencesUpdateDto extends createZodDto(
  preferencesObjectToDbArray,
  { codec: true },
) {}
