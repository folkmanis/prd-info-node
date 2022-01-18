import { OmitType } from '@nestjs/mapped-types';
import { Kaste } from '../entities/kaste.entity';
import { Veikals } from '../entities/veikals';

export class VeikalsKaste extends OmitType(Veikals, ['kastes']) {
  kaste: number;
  kastes: Kaste;
}
