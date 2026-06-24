import { join } from 'path';
import Pdfmake from 'pdfmake';

import appRoot from 'app-root-path';

const __dirname = join(appRoot.path, 'static', 'fonts');

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
  customLinesWithFooter: {
    paddingLeft: (i) => (i === 0 ? 0 : 4),
    paddingRight: (i, node) =>
      i === Number(node.table.widths?.length) - 1 ? 0 : 4,
    paddingTop: () => 4,
    paddingBottom: () => 4,
    vLineWidth: () => 0,
    hLineWidth: (i, node) =>
      i === 0 || i === 1 || i > node.table.body.length - 2 ? 2 : 1,
    hLineColor: (i, node) =>
      i === 0 || i === 1 || (i && i > node.table.body.length - 2)
        ? '#606060'
        : '#909090',
  },
});
// @ts-ignore
Pdfmake.setUrlAccessPolicy(() => true);
export function pdfmakeConfigured() {
  return Pdfmake;
}
