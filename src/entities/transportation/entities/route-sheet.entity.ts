import { ObjectId } from 'mongodb';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransportationVehicle } from './vehicle.entity.js';

export class TransportationRouteSheet {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  _id: ObjectId;

  @IsNumber()
  @Min(1990)
  year: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  fuelRemainingStart: number;

  @Type(() => TransportationVehicle)
  @ValidateNested()
  vehicle: TransportationVehicle;

  @Type(() => RouteTrip)
  @ValidateNested({ each: true })
  trips: RouteTrip[] = [];

  @Type(() => FuelPurchase)
  @ValidateNested({ each: true })
  fuelPurchases: FuelPurchase[] = [];
}

export class RouteTrip {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  tripLength: number;

  @IsNumber()
  fuelConsumed: number;

  @Type(() => RouteTripStop)
  @ValidateNested({ each: true })
  stops: RouteTripStop[] = [];
}

export class RouteTripStop {
  @Type(() => ObjectId)
  @Transform(({ value }) => new ObjectId(value), { toClassOnly: true })
  @IsObject()
  @IsOptional()
  customerId: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  googleLocationId?: string;
}

export class FuelPurchase {
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber()
  amount: number;

  @IsNumber()
  price: number;

  @IsNumber()
  total: number;

  @IsString()
  @IsOptional()
  invoiceId?: string;
}
