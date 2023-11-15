import { ObjectId } from 'mongodb';
import { IsString, IsObject, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sanitizeFileName } from '../../../lib/filename-functions';

export class DropFolder {
  @IsString({ each: true })
  @Transform(({ value }) => [...value].map(sanitizeFileName), {
    toClassOnly: true,
  })
  path: string[];

  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  @IsArray()
  customer: ObjectId[];
}
