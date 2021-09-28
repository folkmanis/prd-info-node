import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Collection, FilterQuery, MongoClient } from 'mongodb';
import { DatabaseService } from '../../../database/database.service';
import { Message } from '../../../messages/entities/message.interface';
import { SystemModules } from '../../../preferences';
import { ModuleUserPreferences, User } from '../entities/user.interface';
import { SessionsDaoService } from './sessions-dao.service';


@Injectable()
export class UsersDaoService {

    private collection: Collection<User>;
    private logger = new Logger(UsersDaoService.name);

    constructor(
        dbService: DatabaseService,
        private sessionsDao: SessionsDaoService,
        @Inject('MONGO_CLIENT') private connection: MongoClient,
    ) {
        this.collection = dbService.db().collection('users');
        this.createIndexes();
    }

    async findAllUsers(): Promise<Partial<User>[]> {
        const projection = {
            _id: 0,
            username: 1,
            name: 1,
            admin: 1,
            last_login: 1,
            preferences: 1,
            userDisabled: 1,
        };
        return this.collection.find({}).project(projection).toArray();
    }

    async getOne(username: string): Promise<User | undefined> {
        const pipeline = [
            {
                $match: { username },
            },
            {
                $lookup: {
                    from: 'sessions',
                    let: { user: '$username' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$session.user.username', '$$user'],
                                },
                            },
                        },
                        {
                            $project: {
                                lastSeen: '$session.lastSeen',
                            },
                        },
                    ],
                    as: 'sessions',
                },
            },
            {
                $project: {
                    _id: 0,
                    password: 0,
                },
            },
        ];
        return this.collection
            .aggregate<User>(pipeline)
            .toArray()
            .then((usr) => usr[0]);
    }

    async addOne(user: User): Promise<User | undefined> {
        const { value } = await this.collection.findOneAndReplace(
            { username: user.username },
            user,
            {
                writeConcern: { w: 'majority' },
                returnDocument: 'after',
                upsert: true,
            }
        );
        return value;
    }

    async updateOne({ username, ...user }: Pick<User, 'username'> & Partial<User>): Promise<User | undefined> {
        const dbSession = this.connection.startSession();
        const { value } = await this.collection.findOneAndUpdate(
            { username },
            { $set: user },
            {
                writeConcern: { w: 'majority' },
                session: dbSession,
                returnDocument: 'after'
            },
        );
        if (value) {
            await this.sessionsDao.deleteUserSessions(
                username,
                dbSession
            );
        }
        dbSession.endSession();
        return value;
    }

    async deleteUser(username: string): Promise<number | undefined> {
        const dbSession = this.connection.startSession();
        const { deletedCount } = await this.collection.deleteOne(
            { username },
            {
                writeConcern: { w: 'majority' },
                session: dbSession,
            },
        );
        if (deletedCount) {
            await this.sessionsDao.deleteUserSessions(
                username,
                dbSession
            );
        }
        dbSession.endSession();
        return deletedCount;
    }

    async login(username: string, password: string): Promise<User | null> {
        const filter: FilterQuery<User> = {
            username,
            password,
            userDisabled: { $not: { $eq: true } },
        };
        const projection = {
            _id: 0,
            username: 1,
            name: 1,
            admin: 1,
            last_login: 1,
            preferences: 1,
            userDisabled: 1,
            messages: 1,
        };

        const { value } = await this.collection.findOneAndUpdate(
            filter,
            { $set: { last_login: new Date() } },
            {
                projection,
                returnDocument: 'after',
            },
        );
        return value as User || null;
    }

    async getModuleUserPreferences(
        username: string,
        module: string,
    ): Promise<ModuleUserPreferences> {
        const pipeline = [
            {
                $match: { username },
            },
            {
                $unwind: { path: '$userPreferences' },
            },
            {
                $match: { 'userPreferences.module': module },
            },
            {
                $replaceRoot: { newRoot: '$userPreferences.options' },
            },
        ];
        return this.collection.aggregate<ModuleUserPreferences>(pipeline).toArray()
            .then(pref => pref[0]);
    }

    async updateModuleUserPreferences(
        username: string,
        module: SystemModules,
        val: { [key: string]: any; },
    ): Promise<number> {
        const user = await this.collection.findOne({ username });
        if (!user) {
            throw new NotFoundException(`Non-existing user ${username}`);
        }

        const userPreferences = user.modulePreferences || [];

        const idx = userPreferences.findIndex((mod) => mod.module === module);
        if (idx === -1) {
            userPreferences.push({
                module,
                options: val,
            });
        } else {
            userPreferences[idx] = {
                module: userPreferences[idx].module,
                options: { ...userPreferences[idx].options, ...val },
            };
        }

        const updRes = await this.collection.updateOne(
            { username },
            { $set: { modulePreferences: userPreferences } },
        );
        return updRes.modifiedCount;
    }

    async setMessage(module: SystemModules, message: Message): Promise<number> {
        const resp = await this.collection.updateMany(
            {
                'preferences.modules': module,
            },
            {
                $push: {
                    messages: message,
                },
            },
        );

        return resp.modifiedCount;
    }

    private async createIndexes() {
        try {
            await this.collection.createIndexes([
                {
                    key: { username: 1 },
                    name: 'username',
                    unique: true,
                },
            ]);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
