import { OmitType } from '@nestjs/mapped-types';
import { Equipment } from '../entities/equipment.entity';

export class CreateEquipmentDto extends OmitType(Equipment, ['_id']) {}
