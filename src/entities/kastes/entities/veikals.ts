import { ObjectId } from 'mongodb';
import { Kaste } from './kaste.entity';
import { Exclude, Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from 'class-validator';

export class Veikals {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  _id: ObjectId;

  @Type(() => Number)
  @IsNumber()
  kods: number;

  @IsString()
  adrese: string;

  @Type(() => Number)
  @IsNumber()
  pasutijums: number;

  @Type(() => Kaste)
  @ValidateNested({ each: true })
  kastes: Kaste[];

  @Type(() => Date)
  @IsDate()
  lastModified = new Date();

  @IsNumber()
  @IsOptional()
  @Exclude()
  kaste?: number;
}
