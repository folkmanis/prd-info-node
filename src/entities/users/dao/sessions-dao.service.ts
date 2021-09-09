import { Injectable } from '@nestjs/common';
import { ClientSession as MongoClientSession, Collection } from 'mongodb';
import { DatabaseService } from '../../../database/database.service';
import { Session } from '../interfaces/session.interface';


@Injectable()
export class SessionsDaoService {

    private collection: Collection<Session>;

    constructor(dbService: DatabaseService) {
        this.collection = dbService.db().collection('users');
    }


    async deleteSession(sessionId: string, dbSession?: MongoClientSession): Promise<number> {
        const resp = await this.collection.deleteOne(
            { _id: sessionId },
            { session: dbSession }
        );
        return resp.deletedCount || 0;
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