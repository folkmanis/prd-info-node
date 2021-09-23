import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class JsonParsePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value ? JSON.parse(value) : {};
  }
}
