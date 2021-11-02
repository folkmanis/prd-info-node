import { ObjectId } from 'mongodb';
import { SessionData } from 'express-session';

export class SessionEntity {
    _id: string;
    expires: Date;
    session: SessionData;
}