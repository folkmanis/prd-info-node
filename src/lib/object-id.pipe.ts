import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { idToObjectId } from './zod-validators.js';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: any, { metatype }: ArgumentMetadata) {
    if (metatype !== ObjectId) {
      return value;
    }

    return idToObjectId.decode(value);
  }
}
