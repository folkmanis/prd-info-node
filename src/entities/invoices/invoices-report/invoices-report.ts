import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import {
  ContentText,
  Margins,
  PageSize,
  Style,
  Table,
  TableCell,
  TDocumentDefinitions,
  TDocumentInformation,
} from 'pdfmake/interfaces.js';
import { pdfMakeConfigured } from '../../../lib/pdf-make-configured.js';
import {
  InvoiceForReport,
  JobBase,
} from '../entities/invoice-for-report.interface.js';
import { InvoiceProduct } from '../entities/invoice.entity.js';

const SMALL: Style = { fontSize: 8 };
const MEDIUM: Style = { fontSize: 10 };
const TITLE: Style = { fontSize: 14, bold: true };

export function invoicesReport(
  invoice: InvoiceForReport,
  locale: Locale = lv,
): PDFKit.PDFDocument {
  const pageSize: PageSize = 'A4';
  const pageMargins: Margins = [30, 30, 30, 30];
  const info: TDocumentInformation = { title: `Report ${invoice.invoiceId}` };

  const titleStr =
    (invoice.customerInfo?.financial?.clientName || invoice.customer) +
    (invoice.invoiceId ? ` / ${invoice.invoiceId}` : '');
  const title: ContentText = { text: titleStr, style: TITLE };

  const productsTable: Table = {
    headerRows: 1,
    body: createProductsTableContent(invoice.products),
  };
  const jobsTable: Table = {
    headerRows: 1,
    body: createJobsTableContent(invoice.jobs, locale),
  };

  const documentDefinition: TDocumentDefinitions = {
    info,
    pageSize,
    pageMargins,
    content: [
      title,
      {
        table: productsTable,
        style: MEDIUM,
        layout: 'lightHorizontalLines',
      },
      {
        table: jobsTable,
        style: SMALL,
        layout: 'lightHorizontalLines',
      },
    ],
  };

  return pdfMakeConfigured().createPdfKitDocument(documentDefinition);
}

function createProductsTableContent(
  products: InvoiceProduct[],
  invoiceTotal?: number,
): TableCell[][] {
  const tbl: TableCell[][] = [];
  const header = [
    'Izstrādājums',
    'skaits',
    { text: 'kopā', alignment: 'right' },
    { text: 'Kopā', alignment: 'right' },
  ];
  tbl.push(header);

  for (const prod of products) {
    tbl.push([
      prod._id,
      `${prod.count} gab.`,
      {
        text: `${prod.price?.toFixed(2) || 0} EUR`,
        alignment: 'right',
      },
      {
        text: `${prod.total?.toFixed(2) || 0} EUR`,
        alignment: 'right',
      },
    ]);
  }

  const footer: TableCell[] = [
    { text: 'Kopā', bold: true, alignment: 'right', colSpan: 3 },
    '',
    '',
    {
      text: `${invoiceTotal?.toFixed(2) || 0} EUR`,
      bold: true,
      alignment: 'right',
    },
  ];
  tbl.push(footer);
  return tbl;
}

function createJobsTableContent(
  jobs: JobBase[] = [],
  locale: Locale,
): TableCell[][] {
  const tbl: TableCell[][] = [];
  tbl.push([
    'datums',
    'nosaukums',
    'izstrādājums',
    { text: 'skaits', alignment: 'right' },
    { text: 'EUR', alignment: 'right' },
  ]);
  for (const job of jobs) {
    const prod = job.products;
    if (!prod || prod.price * prod.count === 0) {
      continue;
    }
    const date = format(new Date(job.receivedDate), 'P', { locale: locale });
    const jobName = job.name;
    const prodName = { text: prod.name, noWrap: true };
    const count = {
      text: prod.count.toString(),
      alignment: 'right',
    };
    const price = {
      text: prod.price.toFixed(2),
      alignment: 'right',
    };

    tbl.push([date, jobName, prodName, count, price]);
  }
  return tbl;
}
