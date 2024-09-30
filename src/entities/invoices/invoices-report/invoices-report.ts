import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import {
  Cell,
  DocumentDefinition,
  Table,
  Txt,
} from 'pdfmake-wrapper/server/index.js';
import { pdfMakeConfigured } from '../../../lib/pdf-make-configured.js';
import {
  InvoiceForReport,
  JobBase,
} from '../entities/invoice-for-report.interface.js';
import { InvoiceProduct } from '../entities/invoice.entity.js';

export function invoicesReport(
  invoice: InvoiceForReport,
  locale: Locale = lv,
): PDFKit.PDFDocument {
  const pdf = new DocumentDefinition();
  pdf.pageSize('A4');
  pdf.pageMargins([30, 30, 30, 30]);
  pdf.info({ title: `Report ${invoice.invoiceId}` });

  const title =
    (invoice.customerInfo?.financial?.clientName || invoice.customer) +
    (invoice.invoiceId ? ` / ${invoice.invoiceId}` : '');
  pdf.add(new Txt(title).fontSize(14).bold().end);
  pdf.add(
    new Table([
      ...createProductsTable(invoice.products),
      [
        '',
        '',
        new Cell(new Txt('Kopā').bold().alignment('right').end).end,
        new Cell(
          new Txt(`${invoice.total?.toFixed(2) || 0} EUR`).bold().end,
        ).alignment('right').end,
      ],
    ])
      .layout('lightHorizontalLines')
      .fontSize(10)
      .headerRows(1).end,
  );
  pdf.add(
    new Table(createJobsTable(invoice.jobs, locale))
      .layout('lightHorizontalLines')
      .fontSize(8)
      .headerRows(1).end,
  );
  return pdfMakeConfigured().createPdfKitDocument(pdf.getDefinition());
}

function createProductsTable(products: InvoiceProduct[]): any[][] {
  const tbl: any[][] = [];
  tbl.push([
    'Izstrādājums',
    'skaits',
    new Txt('cena').alignment('right').end,
    new Txt('kopā').alignment('right').end,
  ]);
  for (const prod of products) {
    tbl.push([
      prod._id,
      `${prod.count} gab.`,
      new Txt(`${prod.price?.toFixed(2) || 0} EUR`).alignment('right').end,
      new Txt(`${prod.total?.toFixed(2) || 0} EUR`).alignment('right').end,
    ]);
  }
  return tbl;
}

function createJobsTable(jobs: JobBase[] = [], locale: Locale): any[][] {
  const tbl: any[][] = [];
  tbl.push([
    // 'nr.',
    'datums',
    'nosaukums',
    'izstrādājums',
    new Txt('skaits').alignment('right').end,
    new Txt('EUR').alignment('right').end,
  ]);
  for (const job of jobs) {
    const prod = job.products;
    if (!prod || prod.price * prod.count === 0) {
      continue;
    }
    tbl.push([
      format(new Date(job.receivedDate), 'P', { locale: locale }),
      job.name,
      prod ? new Txt(prod.name).noWrap().end : '',
      prod ? new Txt(prod.count.toString()).alignment('right').end : '',
      prod
        ? new Txt((prod.price * prod.count).toFixed(2)).alignment('right').end
        : '',
    ]);
  }
  return tbl;
}
