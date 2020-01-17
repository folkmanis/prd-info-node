import { ObjectId } from 'mongodb';

export interface KastesVeikals {
    kods: string,
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
}

export interface KastesPasutijums {
    _id: ObjectId,
    name: string,
    deleted: boolean,
}