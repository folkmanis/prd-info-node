import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value.password === 'string') {
      value.password = hashPassword(value.password);
    }
    return value;
  }
}

function hashPassword(passw: string): string {
  return crypto.createHash('sha256').update(passw).digest('hex');
}
