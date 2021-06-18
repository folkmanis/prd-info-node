import { Session } from '../interfaces/session.interface';
import { MongoClient, Collection, ObjectId, FilterQuery } from "mongodb";
import Logger from '../lib/logger';

let sessions: Collection<Session>;

export class SessionsDAO {
    static async injectDB(conn: MongoClient) {
        if (sessions) {
            return;
        }
        try {
            sessions = conn.db(process.env.DB_BASE as string).collection('sessions');
            Logger.debug('sessions collection injected');
        } catch (error) {
            Logger.error('sessionDAO: unable to connect', error.message);
        }
    }

    static async deleteSession(sessionId: string): Promise<number> {
        const resp = await sessions.deleteOne({ _id: sessionId });
        return resp.deletedCount || 0;
    }

    static async deleteUserSessions(userId: string, sessionIds: string[]): Promise<number> {
        const resp = await sessions.deleteMany({
            'session.user.username': userId,
            _id: {
                $nin: sessionIds,
            }
        });
        return resp.deletedCount || 0;
    }
}