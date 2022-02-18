import Busboy from 'busboy';
import { Request } from 'express';
import { Observable } from 'rxjs';

export interface FileStream {
  fieldname: string;
  file: NodeJS.ReadableStream;
  filename: string;
}

export function rxBusboy(req: Request): Observable<FileStream> {
  return new Observable((subscriber) => {
    const busboy = Busboy({ headers: req.headers });
    busboy.on(
      'file',
      (fieldname: string, file: NodeJS.ReadableStream, fileInfo: Busboy.FileInfo) =>
        subscriber.next({
          fieldname,
          file,
          filename: fileInfo.filename,
        }),
    );

    busboy.on('finish', () => subscriber.complete());

    req.pipe(busboy);

    return () => busboy.removeAllListeners();
  });
}
