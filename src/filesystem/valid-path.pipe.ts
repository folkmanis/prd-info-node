import { BadRequestException, ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { sanitizeFileName } from '../lib/filename-functions';

@Injectable()
export class ValidPathPipe implements PipeTransform<string, string[]> {


  transform(value: string, metadata: ArgumentMetadata) {

    if (typeof value !== 'string') {
      throw new BadRequestException('string value for path expected');
    }

    value = value.replace(/^\/|\/$/g, '');

    const path = value.split('/').map(sanitizeFileName).filter(p => !!p);

    return path;
  }
}
