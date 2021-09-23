import { PartialType } from '@nestjs/mapped-types';
import { CreateXmfSearchDto } from './create-xmf-search.dto';

export class UpdateXmfSearchDto extends PartialType(CreateXmfSearchDto) {}
