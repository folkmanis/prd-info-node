import { Material } from '../entities/material.entity.js';
import { OmitType } from '@nestjs/mapped-types';

export class CreateMaterialDto extends OmitType(Material, ['_id']) { }
