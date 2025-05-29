import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class FuelType {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  units: string;
}

export class TransportationVehicle {
  @Type(() => ObjectId)
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? ObjectId.createFromHexString(value) : value,
    {
      toClassOnly: true,
    },
  )
  @Transform(({ value }) => value.toString(), {
    toPlainOnly: true,
  })
  @IsObject()
  _id: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  licencePlate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  passportNumber: string;

  @IsNumber()
  consumption: number; // units

  @Type(() => FuelType)
  @ValidateNested()
  fuelType: FuelType;

  @IsBoolean()
  disabled = false;
}
