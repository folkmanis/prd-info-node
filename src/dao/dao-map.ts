import { Db } from 'mongodb';
import { Type } from '../interfaces/type';
import { Dao } from '../interfaces/dao.interface';

import { MaterialsDao } from './materialsDAO';
import { CountersDao } from './countersDAO';
import { UsersDao } from './usersDAO';
import { PreferencesDao } from './preferencesDAO';
import { LoggerDao } from './loggerDAO';
import { MessagesDao } from './messagesDAO';
import { NotificationsDao } from './notificationsDAO';
import { EquipmentDao } from './equipmentDAO';
import { ProductionStagesDao } from './production-stagesDAO';

const DAOS: Type<Dao>[] = [
  MaterialsDao,
  CountersDao,
  UsersDao,
  PreferencesDao,
  LoggerDao,
  MessagesDao,
  NotificationsDao,
  EquipmentDao,
  ProductionStagesDao,
];

export class DaoIndexMap extends Map<Type<Dao>, Dao> {
  constructor() {
    super(DAOS.map((DaoClass) => [DaoClass, new DaoClass()]));
  }

  injectDb(db: Db) {
    this.forEach(async (dao) => await dao.injectDb(db));
  }

  getDao<T extends Dao>(type: Type<T>): T {
    return this.get(type) as T;
  }
}
