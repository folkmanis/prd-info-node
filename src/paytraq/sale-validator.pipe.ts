import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { SalesInputSchema } from './interfaces/sales-input.schema';

@Injectable()
export class SaleValidatorPipe implements PipeTransform {
  transform(inputValue: any, metadata: ArgumentMetadata) {
    const { value, error } = SalesInputSchema.validate(inputValue);

    if (error) {
      throw new BadRequestException({ error });
    }

    return value;
  }
}
