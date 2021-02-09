import Ajv, { } from 'ajv';
import { PaytraqClientSchema } from './client-schema';
import { PaytraqClientsSchema } from './clients-schema';

const ajv = new Ajv();

export class XmlValidators {
   static client = ajv.compile(PaytraqClientSchema);
   static clients = ajv.compile(PaytraqClientsSchema);
}
