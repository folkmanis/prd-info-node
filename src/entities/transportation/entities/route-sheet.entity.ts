import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { TransportationVehicle } from './vehicle.entity.js';
import { TransportationDriver } from './driver.entity.js';

export class TransportationRouteSheet {
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

  @IsNumber()
  @Min(1990)
  year: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  fuelRemainingStartLitres: number;

  @Type(() => TransportationDriver)
  @ValidateNested()
  driver: TransportationDriver;

  @Type(() => TransportationVehicle)
  @ValidateNested()
  vehicle: TransportationVehicle;

  @Type(() => RouteTrip)
  @ValidateNested({ each: true })
  trips: RouteTrip[];

  @Type(() => FuelPurchase)
  @ValidateNested({ each: true })
  fuelPurchases: FuelPurchase[];

  totalFuelPurchased = () =>
    this.fuelPurchases?.reduce((prev, curr) => prev + curr.amount, 0) ?? 0;

  fuelUnits = () => {
    if (!this.fuelPurchases) return '';
    return [
      ...new Set(this.fuelPurchases.map((fuelPurchase) => fuelPurchase.units)),
    ].join(',');
  };

  totalFuelConsumed = () =>
    this.trips?.reduce((prev, curr) => prev + curr.fuelConsumed, 0) ?? 0;

  fuelRemaining = () =>
    this.fuelRemainingStartLitres +
    this.totalFuelPurchased() -
    this.totalFuelConsumed();

  totalTripsLength = () =>
    this.trips?.reduce((acc, trip) => acc + trip.tripLengthKm, 0) ?? 0;

  averageConsumption = () => {
    const totalLength = this.totalTripsLength();
    if (totalLength === 0) {
      return 0;
    } else {
      return this.totalFuelConsumed() / totalLength;
    }
  };
}

export class RouteTrip {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  tripLengthKm: number;

  @IsNumber()
  fuelConsumed: number;

  @IsNumber()
  odoStartKm: number;

  @IsNumber()
  odoStopKm: number;

  @IsString()
  @MaxLength(255)
  description: string;

  @Type(() => RouteTripStop)
  @ValidateNested({ each: true })
  stops: RouteTripStop[];
}

export class RouteTripStop {
  @Type(() => ObjectId)
  @Transform(({ value }) => value && ObjectId.createFromHexString(value), {
    toClassOnly: true,
  })
  @Transform(({ value }) => value && value.toString(), {
    toPlainOnly: true,
  })
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

  @IsString()
  type: string;

  @IsString()
  units: string;

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
