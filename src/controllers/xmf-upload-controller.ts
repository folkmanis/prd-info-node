/**
 * /data/xmf-upload/
 */

import { Controller, ClassMiddleware, Post, ClassWrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import { UploadParser } from '../lib/upload-parser';
import Busboy from "busboy";
import readline from 'readline';

@Controller('data/xmf-upload')
@ClassMiddleware(PrdSession.validateAdminSession)
// @ClassWrapper(asyncWrapper)
export class XmfUploadController {

    @Post('file')
    private async file(req: Request, res: Response) {
        const busboy = new Busboy({ headers: req.headers });
        const parser = new UploadParser();
        res.result = {};
        busboy.on('file', async (fieldname, file, filename) => {
            res.result.filename = filename;
            res.result.fieldname = fieldname;
            const rl = readline.createInterface({ input: file, crlfDelay: Infinity });
            for await (const line of rl) {
                await parser.parseLine(line);
            }
        })
        busboy.on('finish', async () => {
            res.result.data = parser.count;
            res.json(res.result);
        }
        );

        req.pipe(busboy);
    }
}