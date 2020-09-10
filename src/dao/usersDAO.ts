import { MongoClient, Collection, ObjectId } from "mongodb";
import { User, UserPreferences, Login, LoginResponse, ResponseBase } from '../interfaces';
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

    static async total(): Promise<number> {
        return await users.countDocuments({});
    }

    static async list(): Promise<User[]> {
        return await users.find<User>({})
            .project(UsersDAO.projection).toArray();
    }

    static async getUser(username: string): Promise<User | null> {
        const pipeline = [
            {
                '$match': { username }
            }, {
                '$lookup': {
                    'from': 'sessions',
                    'let': {                        'user': '$username'                    },
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
        return (await users.aggregate(pipeline).toArray())[0] || null;
    }

    static async addUser(user: User):
        Promise<{ success: boolean; } | { error: Error; }> {
        try {
            await users.insertOne(user, { w: 'majority' });
            return { success: true };
        } catch (error) {
            return { error };
        }
    }

    static async updateUser(user: Partial<User>): Promise<{ success: boolean, error?: any; }> {
        if (!user.username) { // Ja nav lietotājvārds, tad neko nedara
            const error = "User not defined";
            Logger.error(error);
            return { success: false, error };
        }
        try {
            const updResp = await users.updateOne({ username: user.username }, { $set: user }, { w: 'majority' });
            if (updResp.matchedCount === 0) {
                const error = "User not found";
                Logger.error(error);
                return { success: false, error };
            }
            return { success: true };

        } catch (error) {
            Logger.error("User update error ", error);
            return { success: false, error };
        }
    }

    static async deleteUser(username: string): Promise<{ success: boolean, error?: any; }> {
        try {
            const updResp = await users.deleteOne({ username }, { w: 'majority' });
            Logger.debug('Delete result: ', updResp);
            if (updResp.deletedCount === 0) {
                const error = "User not found";
                Logger.error(error);
                return { success: false, error };
            }
            return { success: true };

        } catch (error) {
            Logger.error('User delete error', error);
            return { success: false, error };
        }
    }

    static async login(login: Login): Promise<LoginResponse> {
        const updResp = await users.findOneAndUpdate(
            login,
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