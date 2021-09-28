import { Logger, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { XmfUploadController } from './xmf-upload.controller';
import { Request } from 'express';
import { MessagesService, XmfUploadMessage } from '../../messages';

@Injectable()
export class UploadMessageInterceptor implements NestInterceptor {

  private logger = new Logger(XmfUploadController.name);

  constructor(
    private readonly messaging: MessagesService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req: Request = context.switchToHttp().getRequest();
    const length = req.get('content-length');
    this.logger.log(`Archive upload started with ${length} bytes`);

    return next.handle().pipe(
      tap(result => this.messaging.postMessage(new XmfUploadMessage(result))),
      tap(result => this.logger.log('Xmf archive added', result))
    );
  }
}
