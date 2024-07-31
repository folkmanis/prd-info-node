import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class TransportationDriver {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  _id: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  disabled = false;
}
