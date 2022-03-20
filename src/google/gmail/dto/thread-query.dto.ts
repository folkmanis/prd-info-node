import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

const FORMAT = ['full', 'metadata', 'minimal'];

export class ThreadQuery {
  @Transform(({ value }) => typeof value === 'string' && value.split(','))
  @IsString({ each: true })
  @IsOptional()
  metadataHeaders?: string[];

  @IsIn(FORMAT)
  @IsOptional()
  format?: string;
}
