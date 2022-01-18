import { OmitType } from '@nestjs/mapped-types';
import { VeikalsCreateDto } from './veikals-create.dto';

export class VeikalsUpdateDto extends OmitType(VeikalsCreateDto, [
  'lastModified',
]) {}
