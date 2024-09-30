import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';
import { OmitType } from '@nestjs/mapped-types';

export class CreateRouteSheetDto extends OmitType(TransportationRouteSheet, [
  '_id',
]) {}
