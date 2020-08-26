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

export interface KastesPasutijums {
    _id: ObjectId;
    name: string;
    deleted: boolean;
    created: Date;
    totals: {
        veikali: number;
        colorTotals: ColorTotals[];
        apjomiTotals: ApjomiTotals[];
    };
}

export interface KastesOrderResponse extends ResponseBase<KastesPasutijums> {
    deleted?: {
        veikali: number;
        orders: number;
        ids: ObjectId[];
    };
}
