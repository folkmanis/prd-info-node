import { HttpException, Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import { assertUser } from '../../lib/assertions.js';
import {
  SystemModules,
  SYSTEM_MODULES_KEYS,
} from '../../preferences/interfaces/system-modules.interface.js';
import { UsersDaoService } from './dao/users-dao.service.js';
import { FirebaseUser } from './entities/firebase-user.interface.js';
import { User } from './entities/user.interface.js';

export class InvalidFirebaseUserException extends HttpException {
  constructor() {
    super('User not valid for Firestore app', 404);
  }
}

const USERS_COLLECTION = 'users';
const PERMISSIONS_COLLECTION = 'permissions';

@Injectable()
export class UsersFirestoreService {
  private readonly firestore = getFirestore();

  private get usersCollection() {
    return this.firestore.collection(USERS_COLLECTION);
  }

  private get permissionsCollection() {
    return this.firestore.collection(PERMISSIONS_COLLECTION);
  }

  // eslint-disable-next-line prettier/prettier
  constructor(private usersDao: UsersDaoService) { }

  async setUser(username: string): Promise<number | null | undefined> {
    const user = await this.usersDao.getOne({ username });
    assertUser(user);

    this.assertEmailIsSet(user.eMail);

    const firebaseUser: FirebaseUser = {
      username,
      name: user.name,
    };

    await this.usersCollection
      .doc(user.eMail)
      .set(firebaseUser, { merge: true });

    await this.permissionsCollection
      .doc(user.eMail)
      .set(this.userPermissions(user));

    return 1;
  }

  async deleteUser(username: string) {
    const user = await this.usersDao.getOne({ username });
    assertUser(user);

    this.assertEmailIsSet(user.eMail);

    const batch = this.firestore.batch();

    batch.delete(this.usersCollection.doc(user.eMail));
    batch.delete(this.permissionsCollection.doc(user.eMail));

    return batch.commit();
  }

  private assertEmailIsSet(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
      throw new InvalidFirebaseUserException();
    }
  }

  private userPermissions(user: User): Record<SystemModules, boolean> {
    const modules = user.preferences.modules;
    return SYSTEM_MODULES_KEYS.reduce(
      (acc, curr) => ((acc[curr] = modules.includes(curr)), acc),
      {} as Record<SystemModules, boolean>,
    );
  }
}
