import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { GaxiosError } from 'googleapis-common';


@Catch(GaxiosError)
export class InvalidGrantFilter<GaxiosError> implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {

    const resp: Response = host.switchToHttp().getResponse();

    if (exception.code === '400') {
      resp.status(403).json('Invalid grant');
    }

    resp.status(exception.code || 404).json(exception.message || 'Gmail error');


  }
}
