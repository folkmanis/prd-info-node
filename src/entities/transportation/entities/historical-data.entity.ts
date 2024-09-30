import { IsNumber } from 'class-validator';

export class HistoricalData {
  @IsNumber()
  lastMonth: number;

  @IsNumber()
  lastYear: number;

  @IsNumber()
  fuelRemaining: number;

  @IsNumber()
  lastOdometer: number;
}
