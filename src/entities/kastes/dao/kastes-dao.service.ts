import { Inject, Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { VEIKALI } from './veikali.injector';
import { Veikals } from '../entities/veikals';
import { Kaste } from '../entities/kaste.entity';

@Injectable()
export class KastesDaoService {

    constructor(
        @Inject(VEIKALI) private readonly collection: Collection<Veikals>,
    ) { }

    async findAllKastes(pasutijums: number) {
        const kastesPipeline = [
            {
                $match: { pasutijums },
            },
            {
                $sort: { kods: 1 },
            },
            {
                $unwind: {
                    path: '$kastes',
                    includeArrayIndex: 'kaste',
                    preserveNullAndEmptyArrays: false,
                },
            },
        ];
        return this.collection.aggregate(kastesPipeline).toArray();
    }

    async findOneByPasutijums(pasutijums: number, kods: number, kaste: number) {
        const pipeline = [
            {
                $match: { pasutijums, kods },
            },
            {
                $unwind: {
                    path: '$kastes',
                    includeArrayIndex: 'kaste',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: { kaste },
            },
        ];
        return this.collection.aggregate(pipeline).toArray();
    }

    async findOneById(_id: ObjectId, kaste: number) {
        const pipeline = [
            {
                $match: { _id },
            },
            {
                $unwind: {
                    path: '$kastes',
                    includeArrayIndex: 'kaste',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: { kaste },
            },
        ];
        return this.collection.aggregate(pipeline).toArray();
    }


}