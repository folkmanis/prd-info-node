import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Observable, of } from 'rxjs';
import { map, mapTo, mergeMap, tap } from 'rxjs/operators';
import { MessagesService } from '../../messages';
import {
  NotificationsService,
  SystemNotification,
  Systemoperations,
} from '../../notifications';
import { CustomersDaoService } from './customers-dao/customers-dao.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerNotifyInterceptor implements NestInterceptor {
  private notify = () =>
    this.notifications.notify(
      new SystemNotification({ operation: Systemoperations.MESSAGES_UPDATED }),
    );

  constructor(
    private readonly notifications: NotificationsService,
    private readonly messages: MessagesService,
    private readonly dao: CustomersDaoService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Customer> {
    const { params, body } = context.switchToHttp().getRequest() as Request;

    if (!this.isUpdate(body) || !params.id) {
      return next.handle();
    }

    return of(params.id).pipe(
      mergeMap((id) => this.dao.getCustomerByIdRx(new ObjectId(id))),
      mergeMap((old) =>
        next.handle().pipe(
          mergeMap((upd) =>
            this.notifyMessages(old).pipe(
              mergeMap((result) =>
                result ? of(false) : this.notifyMessages(upd),
              ),
              mapTo(upd),
            ),
          ),
        ),
      ),
    );
  }

  private notifyMessages(customer: Customer): Observable<boolean> {
    const folder = customer.ftpUserData?.folder;

    return !folder
      ? of(false)
      : this.messages.ftpFolderUploads(folder).pipe(
          map((msgs) => msgs.length > 0),
          tap((upd) => upd && this.notify()),
        );
  }

  private isUpdate(upd: UpdateCustomerDto): boolean {
    return (
      typeof upd.ftpUser === 'boolean' ||
      typeof upd.ftpUserData?.folder === 'string' ||
      typeof upd.disabled === 'boolean'
    );
  }
}
