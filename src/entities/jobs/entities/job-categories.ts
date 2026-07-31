import { Contains } from 'class-validator';
import { z } from 'zod';

export const JOB_CATEGORIES = z.enum(['repro', 'perforated paper', 'print']);

export type JobCategories = z.infer<typeof JOB_CATEGORIES>;

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
}

export class PrintProduction extends ProductionCategory {
  @Contains('print')
  category: JobCategories = 'print';
}

export type Production = ReproProduction | KastesProduction | PrintProduction;
