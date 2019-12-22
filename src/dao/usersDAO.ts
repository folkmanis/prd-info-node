import { MongoClient, Collection } from "mongodb";
import { User, UserPreferences } from '../lib/user-class';
import Logger from '../lib/logger';

let users: Collection<User>;

export default class UsersDAO {

    static projection = {
        _id: 0,
        username: 1,
        name: 1,
        admin: 1,
        last_login: 1,
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
        const projection = {
            _id: 0,
            __v: 0,
            password: 0,
        };
        return await users.findOne<User>({ username }, { projection });
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

    static async login(login: { username: string, password: string; }): Promise<User | null> {
        const updResp = await users.findOneAndUpdate(login, { $set: { last_login: new Date() } }, { projection: UsersDAO.projection });
        return updResp.value || null;
    }

    static async getPreferences(username: string): Promise<UserPreferences | null> {
        const user = await UsersDAO.getUser(username);
        if (!user) {
            return null;
        } else {
            return user.preferences || null;
        }
    }
}