import { IsString, IsOptional, IsNumber } from 'class-validator';

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
