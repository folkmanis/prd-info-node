import { Observable, of, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Injectable, Inject, FactoryProvider } from '@nestjs/common';
import { SessionDaoService } from './session-dao.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class SessionService {

    constructor(
        private readonly sessionDao: SessionDaoService,
    ) { }

    validateSession(id: string): Observable<boolean> {
        return from(
            this.sessionDao.findSession(id)
        ).pipe(
            map(sess => !!sess)
        );
    }

}
