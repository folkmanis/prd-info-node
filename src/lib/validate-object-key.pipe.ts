import {
  BadRequestException,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ValidateObjectKeyPipe<T extends Record<string, any>>
  implements PipeTransform {
  private keys: (keyof T)[];

  constructor(@Optional() ...keys: (keyof T)[]) {
    if (!keys) {
      throw new Error('Object type must be provided');
    }
    this.keys = keys;
  }

  transform(value: keyof T) {
    if (typeof value !== 'string' || !this.keys.includes(value)) {
      throw new BadRequestException(
        `${String(value)} must be a string property of ${this.keys}`,
      );
    }

    return value;
  }
}
