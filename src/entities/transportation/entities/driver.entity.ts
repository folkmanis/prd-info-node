import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class TransportationDriver {
  @Type(() => ObjectId)
  @Transform(({ value }) => ObjectId.createFromHexString(value), {
    toClassOnly: true,
  })
  @Transform(({ value }) => value.toString(), {
    toPlainOnly: true,
  })
  @IsObject()
  _id: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  disabled = false;
}
