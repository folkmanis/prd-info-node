import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: any, { metatype }: ArgumentMetadata) {
    if (metatype !== ObjectId) {
      return value;
    }

    try {
      return ObjectId.createFromHexString(value);
    } catch (error) {
      throw new BadRequestException(
        `id must be a single String of 12 bytes or a string of 24 hex characters`,
      );
    }
  }
}
