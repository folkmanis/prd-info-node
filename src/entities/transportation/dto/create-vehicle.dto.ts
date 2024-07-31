import { TransportationVehicle } from '../entities/vehicle.entity.js';
import { OmitType } from '@nestjs/mapped-types';

export class CreateVehicleDto extends OmitType(TransportationVehicle, [
  '_id',
]) {}
