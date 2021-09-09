import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: any, { metatype }: ArgumentMetadata) {
    if (metatype === ObjectId) {
      return new ObjectId(value);
    }
    return value;
  }
}
