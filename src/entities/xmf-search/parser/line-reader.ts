import readline from 'readline';
import { Observable } from 'rxjs';

export function lineReader(
  file: NodeJS.ReadableStream,
  bytesCountFn: (count: number) => void,
): Observable<string> {
  return new Observable((subscriber) => {
    const rl = readline.createInterface({
      input: file,
      crlfDelay: Infinity,
    });
    rl.on('line', (line) => {
      subscriber.next(line);
    });
    rl.on('close', () => {
      subscriber.complete();
    });

    file.on('data', (data: Buffer) => bytesCountFn(data.length));

    return () => {
      rl.close();
      file.removeAllListeners();
    };
  });
}
