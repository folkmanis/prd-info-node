import { Controller, Post, Req } from '@nestjs/common';
import Busboy from 'busboy';
import { Request } from 'express';
import { Modules } from '../../../login';
import { XlsParserService } from './xls-parser.service';

@Controller('kastes')
@Modules('kastes')
export class XlsParserController {
  constructor(private readonly parser: XlsParserService) {}

  @Post('parseXlsx')
  async parseXlsx(@Req() req: Request) {
    const table: Buffer = await new Promise((resolve) => {
      const busboy = Busboy({ headers: req.headers });
      let buffer: Buffer;

      busboy.on('file', (_, file) => {
        const chunks: any[] = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => (buffer = Buffer.concat(chunks)));
      });

      busboy.on('finish', () => resolve(buffer));

      req.pipe(busboy);
    });

    return this.parser.parseXls(table, 'buffer');
  }
}
