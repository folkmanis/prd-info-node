import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class MessageModifyDto {

  @IsString({ each: true })
  @IsOptional()
  addLabelIds?: string[];

  @IsString({ each: true })
  @IsOptional()
  removeLabelIds?: string[];

}