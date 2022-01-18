import { Colors } from './colors';
import { IsNumber, IsBoolean } from 'class-validator';

export type VeikalsKasteLike = Record<Colors, number> & {
  total: number;
  gatavs: boolean;
  uzlime: boolean;
};

export class Kaste implements VeikalsKasteLike {
  @IsNumber()
  yellow = 0;

  @IsNumber()
  rose = 0;

  @IsNumber()
  white = 0;

  @IsNumber()
  total = 0;

  @IsBoolean()
  gatavs = false;

  @IsBoolean()
  uzlime = false;
}
