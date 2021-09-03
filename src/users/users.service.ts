import { Injectable } from '@nestjs/common';
import { Collection, FilterQuery } from "mongodb";
import { DatabaseService } from '../database/database.service';
import { Message, Modules, UserPreferences } from '../interfaces';
import { User } from './user.interface';

@Injectable()
export class UsersService {

    users: Collection<User> = this.dbService.db().collection("users");

    constructor(
        private dbService: DatabaseService,
    ) {
        this.createIndexes();
    }


    async findAllUsers(): Promise<User[]> {
        const projection = {
            _id: 0,
            username: 1,
            name: 1,
            admin: 1,
            last_login: 1,
            preferences: 1,
            userDisabled: 1,
        };
        return this.users.find({})
            .project(projection)
            .toArray();
    }

    async getOne(username: string): Promise<User | undefined> {
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
        return this.users.aggregate(pipeline).toArray().then(usr => usr[0]);
    }

    async addUser(user: User): Promise<number> {
        const { insertedCount } = await this.users.insertOne(user, { writeConcern: { w: 'majority' } });
        return insertedCount;
    }

    async updateUser(user: Partial<User>): Promise<number> {
        const resp = await this.users.updateOne({ username: user.username }, { $set: user }, { writeConcern: { w: 'majority' } });
        return resp.modifiedCount;
    }

    async deleteUser(username: string): Promise<number | undefined> {
        const { deletedCount } = await this.users.deleteOne({ username }, { writeConcern: { w: 'majority' } });
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

        const { value } = await this.users.findOneAndUpdate(
            filter,
            { $set: { last_login: new Date() } },
            {
                projection,
                returnDocument: 'after'
            }
        );
        return value || null;
    }

    async getPreferences(username: string): Promise<UserPreferences | null> {
        const user = await this.getOne(username);
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
    async getUserPreferences(username: string, mod: string): Promise<{ [key: string]: any; }> {
        const pipeline = [{
            $match: { username }
        }, {
            $unwind: { path: "$userPreferences" }
        }, {
            $match: { 'userPreferences.module': mod }
        }, {
            $replaceRoot: { newRoot: '$userPreferences.options' }
        }];
        return (await (this.users.aggregate<{ [key: string]: any; }>(pipeline).toArray()))[0];
    }
    /**
     * Nomaina lietotāja iestatījumus noteiktam modulim
     * @param username Lietotājvārds
     * @param module Modulis
     * @param val Moduļa iestatījumi
     */
    async updateUserPreferences(username: string, module: Modules, val: { [key: string]: any; }): Promise<number> {
        const user = await this.users.findOne({ username });
        if (!user) {
            throw new Error('Non-existing user');
        }

        const userPreferences = user.userPreferences || [];

        const idx = userPreferences.findIndex(mod => mod.module === module);
        if (idx === -1) {
            userPreferences.push({
                module: module,
                options: val
            });
        } else {
            userPreferences[idx] = {
                module: userPreferences[idx].module,
                options: { ...userPreferences[idx].options, ...val }
            };
        }

        const updRes = await this.users.updateOne({ username }, { $set: { userPreferences } });
        return updRes.modifiedCount;
    }

    async setMessage(module: Modules, message: Message<any>): Promise<number> {
        const resp = await this.users.updateMany(
            {
                'preferences.modules': module,
            },
            {
                $push: {
                    messages: message
                }
            }
        );

        return resp.modifiedCount;
    }

    private createIndexes() {
        this.users.createIndexes([
            {
                key: { username: 1 },
                name: 'username',
                unique: true,
            },
        ]);
    }
}