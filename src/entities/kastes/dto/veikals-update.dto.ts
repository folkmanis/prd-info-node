import { OmitType } from '@nestjs/mapped-types';
import { VeikalsCreateDto } from './veikals-create.dto.js';

export class VeikalsUpdateDto extends OmitType(VeikalsCreateDto, [
  'lastModified',
]) { }
