import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';
import Pdfmake from 'pdfmake';

const __dirname = join(dirname(fileURLToPath(import.meta.url)), 'fonts');
Pdfmake.addFonts({
  Roboto: {
    normal: join(__dirname, 'Roboto-Regular.ttf'),
    bold: join(__dirname, 'Roboto-Bold.ttf'),
    italics: join(__dirname, 'Roboto-Italic.ttf'),
    bolditalics: join(__dirname, 'Roboto-BoldItalic.ttf'),
  },
});
Pdfmake.addTableLayouts({
  customLines: {
    paddingLeft: (i) => (i === 0 ? 0 : 4),
    paddingRight: (i, node) =>
      i === Number(node.table.widths?.length) - 1 ? 0 : 4,
    paddingTop: () => 4,
    paddingBottom: () => 4,
    vLineWidth: () => 0,
    hLineWidth: (i, node) =>
      i === 0 || i === 1 || (i && i > node.table.body.length - 1) ? 2 : 1,
    hLineColor: (i, node) =>
      i === 0 || i === 1 || (i && i > node.table.body.length - 1)
        ? '#606060'
        : '#909090',
  },
});
// @ts-ignore
Pdfmake.setUrlAccessPolicy(() => true);
export function pdfmakeConfigured() {
  return Pdfmake;
}
