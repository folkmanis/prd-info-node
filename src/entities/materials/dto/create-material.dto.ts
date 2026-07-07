import { MaterialSchema } from '../entities/material.entity.js';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMaterialSchema = MaterialSchema;
export type CreateMaterial = z.infer<typeof CreateMaterialSchema>;

export class CreateMaterialDto extends createZodDto(CreateMaterialSchema) {}
