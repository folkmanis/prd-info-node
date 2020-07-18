import { ObjectId } from 'mongodb';
import { ResponseBase } from './response-base.interface';

export interface KastesPasutijums {
    _id: ObjectId,
    name: string,
    deleted: boolean,
    created: Date,
}

export interface KastesOrderResponse extends ResponseBase<KastesPasutijums> {
    deleted?: {
        veikali: number;
        orders: number;
        ids: ObjectId[];
    };
}
