import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Attachment } from '../entities/';

export class AttachmentSaveDto {
  @Type(() => Attachment)
  @ValidateNested()
  attachment: Attachment;

  @IsString()
  messageId: string;
}
