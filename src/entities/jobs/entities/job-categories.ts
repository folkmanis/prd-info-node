import { Type } from 'class-transformer';
import { Contains, IsBoolean } from 'class-validator';

export const JOB_CATEGORIES = ['repro', 'perforated paper', 'print'] as const;

export type JobCategories = typeof JOB_CATEGORIES[number];

export abstract class ProductionCategory {
  category: JobCategories;
}

export class ReproProduction extends ProductionCategory {
  @Contains('repro')
  category: JobCategories = 'repro';
}

export class KastesProduction extends ProductionCategory {
  @Contains('perforated paper')
  category: JobCategories = 'perforated paper';

  @Type(() => Boolean)
  @IsBoolean()
  isLocked = false; // ir izveidots pakošanas saraksts
}

export class PrintProduction extends ProductionCategory {
  @Contains('print')
  category: JobCategories = 'print';
}

export type Production = ReproProduction | KastesProduction | PrintProduction;
