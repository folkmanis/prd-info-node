import { OmitType } from '@nestjs/mapped-types';
import { Equipment } from '../entities/equipment.entity.js';

export class CreateEquipmentDto extends OmitType(Equipment, ['_id']) { }
