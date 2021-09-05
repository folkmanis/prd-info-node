import { Db } from 'mongodb';

export abstract class Dao {
  abstract injectDb(db: Db): Promise<void>;
}
