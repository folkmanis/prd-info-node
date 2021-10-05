import { PartialType, IntersectionType, PickType, OmitType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';
import { Material } from '../entities/material.entity';

export class UpdateMaterialDto extends PartialType(OmitType(Material, ['_id'])) { }
