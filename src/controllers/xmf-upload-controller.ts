/**
 * /data/xmf-upload/
 */

import { Controller, ClassMiddleware, Post, ClassWrapper, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { FileParser, UploadProgressTracker } from '../lib/upload-parser';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';
import Busboy from "busboy";
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { file as tmpFile, FileResult } from 'tmp-promise';

@Controller('data/xmf-upload')
@ClassMiddleware([Preferences.getUserPreferences, PrdSession.validateSession, PrdSession.validateModule('xmf-upload')])
// @ClassWrapper(asyncWrapper)
export class XmfUploadController {

    @Post('file')
    private async file(req: Request, res: Response) {
        let parser: FileParser;
        let tracker: UploadProgressTracker = new UploadProgressTracker();
        let tempFile: FileResult;
        let result: {
            filename?: string,
            id?: ObjectId | undefined,
            size?: number;
            [key: string]: number | string | ObjectId | null | undefined,
        } = {};
        /** palaiž statusa sekotāju */
        result.id = (await tracker.start({ username: req.session?.user.username })) || undefined;
        const busboy = new Busboy({ headers: req.headers });
        busboy.on('file', async (fieldname, file, filename) => {
            result.filename = filename;
            result.size = +(req.headers['content-length'] || 0);
            tempFile = await tmpFile({ prefix: 'xmf-', postfix: '.dbd' });
            file.pipe(fs.createWriteStream(tempFile.path));
            req.log.info('xmf-archive upload', result);
        });
        busboy.on('finish', async () => {
            parser = new FileParser(tempFile, tracker);
            res.json(result);
            parser.start();
        }
        );

        req.pipe(busboy);
    }

    @Get('upload-progress')
    private async status(req: Request, res: Response) {
        const id = req.query.id && new ObjectId(req.query.id) || undefined;
        res.json(
            await xmfSearchDAO.getUploadStatus(id)
        );
    }
}