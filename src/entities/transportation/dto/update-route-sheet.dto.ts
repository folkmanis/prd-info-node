import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateRouteSheetDto extends PartialType(
  TransportationRouteSheet,
) {}
