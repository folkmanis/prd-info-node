import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import { join } from 'path';
import Pdfmake from 'pdfmake';
import {
  Cell,
  DocumentDefinition,
  Table,
  Txt,
} from 'pdfmake-wrapper/server/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';

export class TransportationReport {
  private pdf: DocumentDefinition;
  private printer: Pdfmake;

  constructor(
    private routeSheet: TransportationRouteSheet,
    private locale: Locale = lv,
  ) {
    const __dirname = join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../lib/fonts',
    );
    this.pdf = new DocumentDefinition();
    this.printer = new Pdfmake({
      Roboto: {
        normal: join(__dirname, 'Roboto-Regular.ttf'),
        bold: join(__dirname, 'Roboto-Bold.ttf'),
        italics: join(__dirname, 'Roboto-Italics.ttf'),
        bolditalics: join(__dirname, 'Roboto-MediumItalic.ttf'),
      },
    });
    this.pdf.pageSize('A4');
    this.pdf.pageOrientation('landscape');
    this.pdf.pageMargins([30, 30, 30, 30]);
    this.pdf.info({ title: `Maršrutu lapa ${routeSheet._id}` });
  }

  open() {
    const title = `Maršruta lapa ${this.routeSheet._id}`;
    this.pdf.add(new Txt(title).fontSize(14).bold().alignment('center').end);
    this.pdf.add(
      new Txt(
        `${this.routeSheet.year}. gada ${format(new Date().setMonth(this.routeSheet.month - 1), 'LLLL', { locale: this.locale })}`,
      ).end,
    );
    this.pdf.add(new Txt(`Vadītājs ${this.routeSheet.driver.name}`).end);
    this.pdf.add(
      new Txt(
        `Auto ${this.routeSheet.vehicle.name}, ${this.routeSheet.vehicle.licencePlate}`,
      ).end,
    );

    return this.printer.createPdfKitDocument(this.pdf.getDefinition());
  }
}
