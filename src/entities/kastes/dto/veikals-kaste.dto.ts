import { OmitType } from '@nestjs/mapped-types';
import { Kaste } from '../entities/kaste.entity.js';
import { Veikals } from '../entities/veikals.js';

export class VeikalsKaste extends OmitType(Veikals, ['kastes']) {
  kaste: number;
  kastes: Kaste;
}
