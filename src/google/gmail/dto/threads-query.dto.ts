import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ThreadsQuery {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxResults?: number;

  @IsString()
  @IsOptional()
  pageToken?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @Transform(({ value }) => typeof value === 'string' && value.split(','))
  @IsString({ each: true })
  @IsOptional()
  labelIds?: string[];

  @Transform(({ value }) => JSON.parse(value))
  @IsBoolean()
  @IsOptional()
  includeSpamTrash?: boolean;
}
