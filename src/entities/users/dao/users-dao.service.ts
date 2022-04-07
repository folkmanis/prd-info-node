import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Collection, Filter, MongoClient } from 'mongodb';
import { Message } from '../../../messages/entities/message.interface';
import { SystemModules } from '../../../preferences';
import { ModuleUserPreferences, User } from '../entities/user.interface';
import { SessionsDaoService } from './sessions-dao.service';
import { USERS } from './users.provider';


export type LoginCredentials = Partial<Record<'username' | 'password' | 'googleId', string>>;


@Injectable()
export class UsersDaoService {
  constructor(
    @Inject(USERS) private collection: Collection<User>,
    private sessionsDao: SessionsDaoService,
    @Inject('MONGO_CLIENT') private connection: MongoClient,
  ) { }

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

  async validationData<K extends keyof User>(key: K): Promise<User[K][]> {
    return this.collection
      .find(
        {},
        {
          projection: {
            [key]: 1,
            _id: 0,
          },
        },
      )
      .map((val) => val[key])
      .toArray();
  }

  async getOne(filter: Filter<User>): Promise<User | null> {
    return this.collection.findOne(
      filter,
      {
        projection: {
          _id: 0,
          password: 0,
        },
      },
    );
  }

  async addOne(user: User): Promise<User | null> {
    const { value } = await this.collection.findOneAndReplace(
      { username: user.username },
      user,
      {
        writeConcern: { w: 'majority' },
        returnDocument: 'after',
        upsert: true,
      },
    );
    return value;
  }

  async updateOne({
    username,
    ...user
  }: Pick<User, 'username'> & Partial<User>): Promise<User | null> {
    const { value } = await this.collection.findOneAndUpdate(
      { username },
      { $set: user },
      {
        writeConcern: { w: 'majority' },
        returnDocument: 'after',
      },
    );
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
      await this.sessionsDao.deleteUserSessions(username, dbSession);
    }
    dbSession.endSession();
    return deletedCount;
  }


  async login({ username, password, googleId }: LoginCredentials): Promise<User | null> {
    const filter: Filter<User> = {
      userDisabled: { $not: { $eq: true } },
    };

    if (username && password) {
      filter.username = username;
      filter.password = password;
    }

    if (googleId) {
      filter['google.id'] = googleId;
    }

    const projection = {
      _id: 0,
      password: 0,
      userPreferences: 0,
      avatar: 0,
      tokens: 0,
    };

    const { value } = await this.collection.findOneAndUpdate(
      filter,
      { $set: { last_login: new Date() } },
      {
        projection,
        returnDocument: 'after',
      },
    );
    return value;
  }

  async getOneSessionUser(username: string) {
    const projection = {
      _id: 0,
      password: 0,
      userPreferences: 0,
      avatar: 0,
      tokens: 0,
    };
    return this.collection.findOne({ username }, { projection });
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
    return this.collection
      .aggregate<ModuleUserPreferences>(pipeline)
      .toArray()
      .then((pref) => pref[0]);
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

    const userPreferences = user.userPreferences || [];

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

    const { modifiedCount } = await this.collection.updateOne(
      { username },
      { $set: { userPreferences } },
    );
    return modifiedCount;
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
}
