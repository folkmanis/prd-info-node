import { Type } from '../interfaces/type';
import { Dao } from '../interfaces/dao.interface';
import { DaoIndexMap } from '../dao-next/dao-map';

import { UsersController } from './users-controller';
import { LoginController } from './login-controller';
import { XmfSearchController } from './xmf-search-controller';
import { XmfUploadController } from './xmf-upload-controller';
import { KastesController } from './kastes-controller';
import { KastesOrderController } from './kastes-orders-controller';
import { PreferencesController } from './preferences-controller';
import { LogController } from './log-controller';
import { CustomersController } from './customers-controller';
import { ProductsController } from './products-controller';
import { JobsController } from './jobs-controller';
import { InvoicesController } from './invoices.controller';
import { PaytraqController } from './paytraq.controller';
import { MaterialsController } from './materials-controller';


const CONTROLLERS: Type<any>[] = [
    UsersController,
    LoginController,
    XmfSearchController,
    XmfUploadController,
    KastesController,
    KastesOrderController,
    PreferencesController,
    LogController,
    CustomersController,
    ProductsController,
    JobsController,
    InvoicesController,
    PaytraqController,
    MaterialsController,
];

export function createControllers(daoMap: DaoIndexMap): any[] {
    return CONTROLLERS.map(CType => controllerFactory(CType, daoMap));
}

function controllerFactory<T>(type: Type<T>, daoMap: DaoIndexMap): T {
    const deps: Type<Dao>[] = Reflect.getMetadata('design:paramtypes', type) || [];
    console.log(deps);
    const params = deps.map(dep => getDep(daoMap, dep));
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
