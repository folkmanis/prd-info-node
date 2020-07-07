import { ObjectId, Timestamp } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export interface KastesVeikals {
    kods: number | string,
    adrese: string,
    pasutijums: ObjectId,
    kastes: {
        total: number,
        yellow: number,
        rose: number,
        white: number,
        gatavs: boolean,
        uzlime: boolean,
    }[],
    lastModified: Date,
    kaste?: number,
}

export interface KastesPasutijums {
    _id: ObjectId,
    name: string,
    deleted: boolean,
    created: Date,
}

export interface KastesResponse extends ResponseBase {
    apjomi?: number[];
    userPreferences?: { [key: string]: any; };
}
