import { TransportationDriver } from '../entities/driver.entity.js';
import { OmitType } from '@nestjs/mapped-types';

export class CreateDriverDto extends OmitType(TransportationDriver, ['_id']) {}
