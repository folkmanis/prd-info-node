import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';
import Pdfmake from 'pdfmake';

export function pdfMakeConfigured(): Pdfmake {
  const __dirname = join(dirname(fileURLToPath(import.meta.url)), 'fonts');
  return new Pdfmake({
    Roboto: {
      normal: join(__dirname, 'Roboto-Regular.ttf'),
      bold: join(__dirname, 'Roboto-Bold.ttf'),
      italics: join(__dirname, 'Roboto-Italics.ttf'),
      bolditalics: join(__dirname, 'Roboto-MediumItalic.ttf'),
    },
  });
}
