import { JSONSchemaType } from 'ajv';
import { PaytraqClients } from '../../interfaces';
import { PaytraqClientSchema } from './client-schema';

export const PaytraqClientsSchema: JSONSchemaType<PaytraqClients> = {
    type: 'object',
    properties: {
        clients: {
            type: 'array',
            items: PaytraqClientSchema,
        }
    },
    required: ['clients'],
}