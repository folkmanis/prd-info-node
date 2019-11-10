/**
 * data/xmf-search/search?q=<string>
 */

import { Controller, ClassMiddleware, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Connection, Model } from "mongoose";
import { ArchiveJobSchema, ArchiveJob } from '../lib/xmf-archive-class';

interface ArchiveRecord {
    count: number;
    data?: ArchiveData[];
}

interface ArchiveData {
    JDFJobID: string,
    DescriptiveName: string,
    CustomerName: string,
    Archives: {
        Location: string,
        Date: string,
        Action: number,
    }[]
}
interface Filter {
    JDFJobID?: {},
    DescriptiveName: {},
    CustomerName?: {},
}


@Controller('data/xmf-search')
@ClassMiddleware(PrdSession.validateSession)
@ClassWrapper(asyncWrapper)
export class XmfSearchController {

    @Get('search')
    private async search(req: Request, res: Response) {

        const result: ArchiveRecord = { count: 0, data: [] };
        const q: string = req.query.q.trim();
        const filter: any = {
            $or: [
                { DescriptiveName: { $regex: q, $options: 'i' } },
                { JDFJobID: { $regex: q, $options: 'i' } },
            ]
        };
        if (req.query.customers) {
            filter.CustomerName = { $in: req.query.customers.split(',') };
        }
        const projection = '-_id JDFJobID DescriptiveName CustomerName Archives.Location Archives.Date Archives.Action';
        const mongo: Connection = req.mongo;
        const ArchiveJob: Model<ArchiveJob> = mongo.model('xmfArchive', ArchiveJobSchema);
        result.count = await ArchiveJob.countDocuments(filter);
        if (result.count === 0) {
            res.json(result);
            return;
        }

        result.data = await ArchiveJob.find(filter, projection).limit(100).sort({JDFJobID: 1});
        res.json(result);

    }

}
