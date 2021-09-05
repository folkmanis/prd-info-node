import { ClassMiddleware, Controller, Get, Post } from '@overnightjs/core';
import Busboy from 'busboy';
import { Request, Response } from 'express';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { file as tmpFile, FileResult } from 'tmp-promise';
import { XmfSearchDao } from '../dao';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';
import { FileParser, UploadProgressTracker } from '../lib/upload-parser';

@Controller('data/xmf-upload')
@ClassMiddleware([
  Preferences.getUserPreferences,
  PrdSession.validateSession,
  PrdSession.validateModule('xmf-upload'),
])
// @ClassWrapper(asyncWrapper)
export class XmfUploadController {
  constructor(private xmfSearchDao: XmfSearchDao) {}

  @Post('file')
  private async file(req: Request, res: Response) {
    let parser: FileParser;
    const tracker: UploadProgressTracker = new UploadProgressTracker(
      this.xmfSearchDao,
    );
    let tempFile: FileResult;
    const result: {
      filename?: string;
      id?: ObjectId | undefined;
      size?: number;
      [key: string]: number | string | ObjectId | null | undefined;
    } = {};
    /** palaiž statusa sekotāju */
    result.id =
      (await tracker.start({ username: req.session?.user?.username })) ||
      undefined;
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', async (fieldname, file, filename) => {
      result.filename = filename;
      result.size = +(req.headers['content-length'] || 0);
      tracker.update({ fileName: result.filename, fileSize: result.size });
      tempFile = await tmpFile({ prefix: 'xmf-', postfix: '.dbd' });
      file.pipe(fs.createWriteStream(tempFile.path));
      req.log.info('xmf-archive upload', result);
    });
    busboy.on('finish', async () => {
      parser = new FileParser(tempFile, tracker, this.xmfSearchDao);
      res.json(result);
      parser.start();
    });

    req.pipe(busboy);
  }

  @Get('upload-progress')
  private async status(req: Request, res: Response) {
    const id =
      (req.query.id && new ObjectId(req.query.id as string)) || undefined;
    res.json(await this.xmfSearchDao.getUploadStatus(id));
  }
}
