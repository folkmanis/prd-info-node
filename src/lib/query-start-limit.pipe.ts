import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class StartAndLimit {
  @Type(() => Number)
  @IsNumber()
  start: number = 0;

  @Type(() => Number)
  @IsNumber()
  limit: number = 100;

  @IsOptional()
  filter?: string;
}


@Injectable()
export class QueryStartLimitPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const query = plainToClass(StartAndLimit, value);
    await validate(query);
    return query;
  }
}
