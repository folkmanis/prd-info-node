import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { SalesInputSchema } from './interfaces/sales-input.schema.js';

@Injectable()
export class SaleValidatorPipe implements PipeTransform {
  transform(inputValue: any) {
    const { value, error } = SalesInputSchema.validate(inputValue);

    if (error) {
      throw new BadRequestException({ error });
    }

    return value;
  }
}
