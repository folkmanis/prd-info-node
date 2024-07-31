import { TransportationVehicle } from '../entities/vehicle.entity.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateVehicleDto extends PartialType(TransportationVehicle) {}
