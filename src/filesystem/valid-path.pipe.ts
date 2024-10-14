import { Injectable, PipeTransform } from '@nestjs/common';
import { sanitizeFileName } from '../lib/filename-functions.js';

@Injectable()
export class ValidPathPipe implements PipeTransform<string, string[]> {
  transform(value: string) {
    if (Array.isArray(value) && value.every((s) => typeof s === 'string')) {
      return value;
    }

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
