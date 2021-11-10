import { Injectable } from '@nestjs/common';
import { ClientSession as MongoClientSession, Collection } from 'mongodb';
import { UserSession } from '../entities/user.interface';
import { DatabaseService } from '../../../database/database.service';
import { Session } from '../entities/session.interface';


@Injectable()
export class SessionsDaoService {

    private collection: Collection<Session>;

    constructor(dbService: DatabaseService) {
        this.collection = dbService.db().collection('sessions');
    }


    async deleteSessions(username: string, sessionId: string[]): Promise<number | undefined> {
        const { deletedCount } = await this.collection.deleteMany(
            {
                _id: { $in: sessionId },
                "session.user.username": username,
            },
        );
        return deletedCount || 0;
    }

    async userSessions(username: string): Promise<UserSession[]> {
        return this.collection.find<UserSession>(
            {
                'session.user.username': username
            },
            {
                projection: {
                    _id: 1,
                    lastSeen: "$session.lastSeen"
                }
            }
        )
            .toArray();
    }

    async deleteUserSessions(
        userId: string,
        dbSession?: MongoClientSession,
    ): Promise<number> {
        const resp = await this.collection.deleteMany(
            {
                'session.user.username': userId,
            },
            { session: dbSession },
        );
        return resp.deletedCount || 0;
    }


}