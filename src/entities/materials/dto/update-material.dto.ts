import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Material } from '../entities/material.entity.js';

export class UpdateMaterialDto extends PartialType(
  OmitType(Material, ['_id']),
) { }
