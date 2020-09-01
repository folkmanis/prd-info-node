import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export type Colors = 'yellow' | 'rose' | 'white';

export interface ColorTotals {
    color: Colors;
    total: number;
}

export interface ApjomiTotals {
    apjoms: number;
    total: number;
}

export interface KastesOrder {
    _id: ObjectId;
    name: string;
    deleted: boolean;
    created: Date;
    dueDate: Date; // Izpildes termiņš
    isLocked: boolean; // ir izveidots pakošanas saraksts
    totals: {
        veikali: number;
        colorTotals: ColorTotals[];
        apjomiTotals: ApjomiTotals[];
    };
    apjomsPlanned: ColorTotals[];
}

export type KastesOrderPartialKeys = '_id' | 'name' | 'created' | 'deleted' | 'isLocked' | 'dueDate';

export type KastesOrderPartial = Pick<KastesOrder, KastesOrderPartialKeys>;

export interface KastesOrderResponse extends ResponseBase<KastesOrder> {
    deleted?: {
        veikali: number;
        orders: number;
        ids: ObjectId[];
    };
}
