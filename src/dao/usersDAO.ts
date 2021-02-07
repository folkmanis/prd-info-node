import { MongoClient, Collection, ObjectId, FilterQuery } from "mongodb";
import { User, UserPreferences, Login, LoginResponse, ResponseBase, UsersResponse } from '../interfaces';
import Logger from '../lib/logger';

let users: Collection<User>;

export class UsersDAO {

    static projection = {
        _id: 0,
        username: 1,
        name: 1,
        admin: 1,
        last_login: 1,
        preferences: 1,
        userDisabled: 1,
    };


    static async injectDB(conn: MongoClient) {
        if (users) {
            return;
        }
        try {
            users = conn.db(process.env.DB_BASE as string).collection("users");
            Logger.debug("users collection injected");
        } catch (e) {
            Logger.error(`usersDAO: unable to connect`, e);
        }
    }

    static async list(): Promise<User[]> {
        return await users.find({})
            .project(UsersDAO.projection).toArray();
    }

    static async getUser(username: string): Promise<User | undefined> {
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
        return users.aggregate(pipeline).toArray().then(usr => usr[0]);
    }

    static async addUser(user: User): Promise<UsersResponse> {
        try {
            const result = await users.insertOne(user, { w: 'majority' });
            return {
                error: false,
                insertedCount: result.insertedCount,
                insertedId: user.username,
            };
        } catch (error) {
            return { error };
        }
    }

    static async updateUser(user: Partial<User>): Promise<UsersResponse> {
        if (!user.username) { // Ja nav lietotājvārds, tad neko nedara
            const error = new Error('User not defined');
            Logger.error(error.message);
            return { error };
        }
        try {
            const resp = await users.updateOne({ username: user.username }, { $set: user }, { w: 'majority' });
            return {
                error: false,
                modifiedCount: resp.modifiedCount,
                result: resp.result,
            };
        } catch (error) {
            Logger.error("User update error ", error);
            return { error };
        }
    }

    static async deleteUser(username: string): Promise<UsersResponse> {
        try {
            const { deletedCount, result } = await users.deleteOne({ username }, { w: 'majority' });
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

    static async login(login: Login): Promise<LoginResponse> {
        const filter: FilterQuery<User> = {
            ...login,
            userDisabled: { $not: { $eq: true } },
        };
        const updResp = await users.findOneAndUpdate(
            filter,
            { $set: { last_login: new Date() } },
            { projection: UsersDAO.projection }
        );
        return {
            error: !updResp.ok,
            data: updResp.value,
        };
    }

    static async getPreferences(username: string): Promise<UserPreferences | null> {
        const user = await UsersDAO.getUser(username);
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
    static async getUserPreferences(username: string, mod: string): Promise<{ error: any;[key: string]: any; }> {
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
                userPreferences: (await users.aggregate<{ [key: string]: any; }>(pipeline).toArray())[0],
            };
        } catch (error) { return { error }; }
    }
    /**
     * Nomaina lietotāja iestatījumus noteiktam modulim
     * @param username Lietotājvārds
     * @param mod Modulis
     * @param val Moduļa iestatījumi
     */
    static async updateUserPreferences(username: string, mod: string, val: { [key: string]: any; }): Promise<ResponseBase> {
        try {
            const updRes = await users.updateOne({ username, 'userPreferences.module': mod }, { $set: { "userPreferences.$.options": val } });
            return {
                error: null,
                modifiedCount: updRes.modifiedCount,
            };
        } catch (error) { return { error }; }

    }
}