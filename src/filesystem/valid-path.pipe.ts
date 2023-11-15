import { Injectable, PipeTransform } from '@nestjs/common';
import { sanitizeFileName } from '../lib/filename-functions';

@Injectable()
export class ValidPathPipe implements PipeTransform<string, string[]> {
  transform(value: string) {
    if (typeof value !== 'string') {
      return [];
    }

    value = value.replace(/^\/|\/$/g, '');

    const path = value
      .split('/')
      .map(sanitizeFileName)
      .filter((p) => !!p);

    return path;
  }
}
