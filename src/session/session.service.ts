import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionDaoService } from './session-dao.service.js';

@Injectable()
export class SessionService {
  constructor(private readonly sessionDao: SessionDaoService) { }

  validateSession(id: string): Observable<boolean> {
    return from(this.sessionDao.findSession(id)).pipe(map((sess) => !!sess));
  }
}
