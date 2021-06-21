import { Db } from 'mongodb';
import { Type } from '../interfaces/type';
import { Dao } from '../interfaces/dao.interface';

import { MaterialsDao } from './materialsDAO';
import { CountersDAO } from './countersDAO';
import { UsersDao } from './usersDAO';
import { PreferencesDao } from './preferencesDAO';


const DAOS: Type<Dao>[] = [
    MaterialsDao,
    CountersDAO,
    UsersDao,
    PreferencesDao
];

export class DaoIndexMap extends Map<Type<Dao>, Dao> {

    constructor() {
        super(
            DAOS.map(DaoClass => [DaoClass, new DaoClass()])
        );
    }

    injectDb(db: Db) {
        this.forEach(async (dao) => await dao.injectDb(db));
    }

    getDao<T extends Dao>(type: Type<T>): T {
        return this.get(type) as T;
    }

}