import { Type } from '../interfaces/type';
import { Dao } from '../interfaces/dao.interface';
import { DaoIndexMap } from '../dao/dao-map';

import { MaterialsController } from './materials-controller';
import { ProductionStagesController } from './production-stages.controller';

const CONTROLLERS: Type<any>[] = [
  MaterialsController,
  ProductionStagesController,
];

export function createControllers(daoMap: DaoIndexMap): any[] {
  return CONTROLLERS.map((CType) => controllerFactory(CType, daoMap));
}

function controllerFactory<T>(type: Type<T>, daoMap: DaoIndexMap): T {
  const deps: Type<Dao>[] =
    Reflect.getMetadata('design:paramtypes', type) || [];
  const params = deps.map((dep) => getDep(daoMap, dep));
  return new type(...params);
}

function getDep(daoMap: DaoIndexMap, dep: Type<Dao>): Dao {
  const param = daoMap.get(dep);
  if (!param) {
    console.error('Dependency not resolved', dep);
    process.exit(1);
  }
  return param;
}
