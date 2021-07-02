import { MongoClient, Collection, ObjectId, FilterQuery, Db } from "mongodb";
import { User, UserPreferences, Login, LoginResponse, ResponseBase, UsersResponse } from '../interfaces';
import Logger from '../lib/logger';
import { Dao } from '../interfaces/dao.interface';


export class UsersDao extends Dao {
    users!: Collection<User>;

    private readonly projection = {
        _id: 0,
        username: 1,
        name: 1,
        admin: 1,
        last_login: 1,
        preferences: 1,
        userDisabled: 1,
    };


    async injectDb(db: Db) {
        try {
            this.users = db.collection("users");
        } catch (e) {
            Logger.error(`usersDAO: unable to connect`, e);
        }
    }

    async list(): Promise<User[]> {
        return await this.users.find({})
            .project(this.projection).toArray();
    }

    async getUser(username: string): Promise<User | undefined> {
        const pipeline = [
            {
                '$match': { username }
            }, {
                '$lookup': {
                    'from': 'sessions',
                    'let': { 'user': '$username' },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$session.user.username', '$$user'
                                    ]
                                }
                            }
                        }, {
                            '$project': {
                                'lastSeen': '$session.lastSeen'
                            }
                        }
                    ],
                    'as': 'sessions'
                }
            }, {
                '$project': {
                    '_id': 0,
                    'password': 0
                }
            }
        ];
        const projection = {
            _id: 0,
            password: 0,
        };
        return this.users.aggregate(pipeline).toArray().then(usr => usr[0]);
    }

    async addUser(user: User): Promise<UsersResponse> {
        try {
            const result = await this.users.insertOne(user, { writeConcern: { w: 'majority' } });
            return {
                error: false,
                insertedCount: result.insertedCount,
                insertedId: user.username,
            };
        } catch (error) {
            return { error };
        }
    }

    async updateUser(user: Partial<User>): Promise<number> {
        const resp = await this.users.updateOne({ username: user.username }, { $set: user }, { writeConcern: { w: 'majority' } });
        return resp.modifiedCount;
    }

    async deleteUser(username: string): Promise<UsersResponse> {
        try {
            const { deletedCount, result } = await this.users.deleteOne({ username }, { writeConcern: { w: 'majority' } });
            return {
                error: false,
                deletedCount,
                result,
            };
        } catch (error) {
            Logger.error('User delete error', error);
            return { error };
        }
    }

    async login(login: Login): Promise<LoginResponse> {
        const filter: FilterQuery<User> = {
            ...login,
            userDisabled: { $not: { $eq: true } },
        };
        const updResp = await this.users.findOneAndUpdate(
            filter,
            { $set: { last_login: new Date() } },
            { projection: this.projection }
        );
        return {
            error: !updResp.ok,
            data: updResp.value,
        };
    }

    async getPreferences(username: string): Promise<UserPreferences | null> {
        const user = await this.getUser(username);
        if (!user) {
            return null;
        } else {
            return user.preferences || null;
        }
    }
    /**
     * Iegūst lietotāja preferences noteiktam modulim
     * @param username Lietotājvārds
     * @param mod Modulis
     */
    async getUserPreferences(username: string, mod: string): Promise<{ error: any;[key: string]: any; }> {
        const pipeline = [{
            $match: { username }
        }, {
            $unwind: { path: "$userPreferences" }
        }, {
            $match: { 'userPreferences.module': mod }
        }, {
            $replaceRoot: { newRoot: '$userPreferences.options' }
        }];
        try {
            return {
                error: null,
                userPreferences: (await this.users.aggregate<{ [key: string]: any; }>(pipeline).toArray())[0],
            };
        } catch (error) { return { error }; }
    }
    /**
     * Nomaina lietotāja iestatījumus noteiktam modulim
     * @param username Lietotājvārds
     * @param mod Modulis
     * @param val Moduļa iestatījumi
     */
    async updateUserPreferences(username: string, mod: string, val: { [key: string]: any; }): Promise<ResponseBase> {
        try {
            const updRes = await this.users.updateOne({ username, 'userPreferences.module': mod }, { $set: { "userPreferences.$.options": val } });
            return {
                error: null,
                modifiedCount: updRes.modifiedCount,
            };
        } catch (error) { return { error }; }

    }
}