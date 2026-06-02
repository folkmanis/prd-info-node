import { IsString, IsOptional, IsNumber } from 'class-validator';
import { z } from 'zod';
export class JobProduct {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  count: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsString()
  units: string;
}

export const JobProductSchema = z.object({
  name: z.string(),
  units: z.string(),
  price: z.number(),
  count: z.number(),
  comment: z.string().nullable().default(''),
});
