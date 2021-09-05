import { Session } from '../interfaces/session.interface';
import { MongoClient, Collection, Db, ObjectId, FilterQuery } from 'mongodb';
import Logger from '../lib/logger';
import { Dao } from '../interfaces/dao.interface';

export class SessionsDao extends Dao {
  private sessions!: Collection<Session>;

  async injectDb(db: Db) {
    try {
      this.sessions = db.collection('sessions');
    } catch (err: any) {
      Logger.error('sessionDAO: unable to connect', err.message);
    }
  }

  async deleteSession(sessionId: string): Promise<number> {
    const resp = await this.sessions.deleteOne({ _id: sessionId });
    return resp.deletedCount || 0;
  }

  async deleteUserSessions(
    userId: string,
    sessionIds: string[],
  ): Promise<number> {
    const resp = await this.sessions.deleteMany({
      'session.user.username': userId,
      _id: {
        $nin: sessionIds,
      },
    });
    return resp.deletedCount || 0;
  }
}
