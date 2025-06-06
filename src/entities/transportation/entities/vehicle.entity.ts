import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
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

export class OdometerReading {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;
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

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  vin: string;

  @IsNumber()
  consumption: number; // units

  @Type(() => FuelType)
  @ValidateNested()
  fuelType: FuelType;

  @Type(() => OdometerReading)
  @ValidateNested({ each: true })
  odometerReadings: OdometerReading[];

  @IsBoolean()
  disabled = false;
}
