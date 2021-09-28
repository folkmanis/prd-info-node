import { PartialType } from '@nestjs/mapped-types';
import { CreateKasteDto } from './create-kaste.dto';

export class UpdateKasteDto extends PartialType(CreateKasteDto) {}
