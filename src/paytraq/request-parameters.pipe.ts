import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { RequestParametersSchema } from './interfaces/request-parameters.schema.js';

@Injectable()
export class RequestParametersPipe implements PipeTransform {
  transform(inputValue: any) {
    const { value, error } = RequestParametersSchema.validate(inputValue);

    if (error) {
      throw new BadRequestException(error);
    }

    return value;
  }
}
