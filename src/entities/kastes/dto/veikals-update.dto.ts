import { OmitType, PartialType } from '@nestjs/mapped-types';
import { VeikalsCreateDto } from './veikals-create.dto';

export class VeikalsUpdateDto extends OmitType(VeikalsCreateDto, ['_id', 'lastModified']) { }
