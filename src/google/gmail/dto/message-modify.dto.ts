import { IsOptional, IsString } from 'class-validator';

export class MessageModifyDto {
  @IsString({ each: true })
  @IsOptional()
  addLabelIds?: string[];

  @IsString({ each: true })
  @IsOptional()
  removeLabelIds?: string[];
}
