import { TransportationDriver } from '../entities/driver.entity.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDriverDto extends PartialType(TransportationDriver) {}
