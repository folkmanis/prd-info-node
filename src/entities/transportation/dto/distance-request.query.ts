import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { RouteTripStop } from '../entities/route-sheet.entity.js';
import { PickType } from '@nestjs/mapped-types';

export class RouteTripStopAddress extends PickType(RouteTripStop, [
  'address',
  'googleLocationId',
] as const) {}

export class DistanceRequestQuery {
  @Type(() => RouteTripStopAddress)
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @IsArray()
  tripStops: RouteTripStopAddress[];
}
