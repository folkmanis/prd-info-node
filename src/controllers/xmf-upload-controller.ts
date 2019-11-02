/**
 * /data/xmf-upload/
 */

import { Controller, ClassMiddleware, Post, ClassWrapper } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncQuery, MysqlPool } from '../lib/mysql-connector';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { UploadParser } from '../lib/upload-parser';
import Busboy from "busboy";
import readline from 'readline';

@Controller('data/xmf-upload')
@ClassMiddleware(PrdSession.validateSession)
@ClassWrapper(asyncWrapper)
export class XmfUploadController {

    @Post('file')
    private async file(req: Request, res: Response) {
        res.result = {
            body: req.body,
            method: req.method,
            headers: req.headers,
        };

        const busboy = new Busboy({ headers: req.headers });
        const parser = new UploadParser(req.sqlConnection, req.mongo);
        busboy.on('file', async (fieldname, file, filename) => {
            res.result.filename = filename;
            res.result.fieldname = fieldname;
            const rl = readline.createInterface({ input: file, crlfDelay: Infinity });
            for await (const line of rl) {
                parser.parseLine(line);
            }
        })
        busboy.on('finish', async () => {
            res.result.data = parser.counter;
            res.json(res.result);
        }
        );

        req.pipe(busboy);
    }
}