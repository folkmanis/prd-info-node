import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import { sanitizeFileName } from '../../../lib/filename-functions.js';

export class DropFolder {
  @IsString({ each: true })
  @Transform(({ value }) => [...value].map(sanitizeFileName), {
    toClassOnly: true,
  })
  path: string[];

  @IsArray()
  customers: string[];
}
