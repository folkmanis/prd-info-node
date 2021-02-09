import { JSONSchemaType } from 'ajv';
import { PaytraqClient, PaytraqClientObject } from '../../interfaces';

export const PaytraqClientObjectSchema: JSONSchemaType<PaytraqClientObject> = {
    type: 'object',
    properties: {
        clientID: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        type: { type: 'number' },
        status: { type: 'number' },
        regNumber: { type: 'string' },
        vatNumber: { type: 'string', nullable: true },
        legalAddress: {
            type: 'object',
            properties: {
                address: { type: 'string' },
                zip: { type: 'string' },
                country: { type: 'string' },
            },
            required: [],
            additionalProperties: false,
        },
        phone: { type: 'string', nullable: true },
        financialData: {
            type: 'object',
            properties: {
                creditLimit: { type: 'number', nullable: true },
                deposit: { type: 'number', nullable: true },
                discount: { type: 'number', nullable: true },
                payTerm: {
                    type: 'object',
                    properties: {
                        payTermType: { type: 'number', nullable: true },
                        payTermDays: { type: 'number', nullable: true },
                    },
                    required: []
                },
            },
            required: [],
            nullable: true,
        },
        clientGroup: {
            type: 'object',
            properties: {
                groupID: { type: 'number', nullable: true },
                groupName: { type: 'string', nullable: true },
            },
            required: [],
        },
        timeStamps: {
            type: 'object',
            properties: {
                created: { type: 'string' },
                updated: { type: 'string' },
            },
            required: []
        }

    },
    required: ['clientID', 'name'],
    additionalProperties: true,
};

export const PaytraqClientSchema: JSONSchemaType<PaytraqClient> = {
    type: 'object',
    properties: {
        client: PaytraqClientObjectSchema
    },
    required: ['client'],
    additionalProperties: false,
}