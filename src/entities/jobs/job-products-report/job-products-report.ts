import { JobsProductsTotals } from '../dto/jobs-products-totals.js';
import { ProductsQuery } from '../dto/products-query.js';
import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import {
  Content,
  Column,
  ContentText,
  Margins,
  PageSize,
  Style,
  Table,
  TableCell,
  TDocumentDefinitions,
  TDocumentInformation,
} from 'pdfmake/interfaces.js';
import { pdfmakeConfigured } from '../../../lib/pdf-make-configured.js';

const SMALL: Style = { fontSize: 8 };
const MEDIUM: Style = { fontSize: 10, lineHeight: 1.2 };
const TITLE: Style = { fontSize: 14, bold: true };

let locale = lv;

export function jobProductsReport(
  query: ProductsQuery,
  data: JobsProductsTotals[],
  l?: Locale,
) {
  if (l) {
    locale = l;
  }
  const pageSize: PageSize = 'A4';
  const pageMargins: Margins = [30, 30, 30, 30];
  const info: TDocumentInformation = { title: `Kopskaits` };

  const titleStr = `Kopējie daudzumi`;

  const title: ContentText = { text: titleStr, style: TITLE };

  const headerColumns: Column[] = [
    { stack: createHeaderLeftColumn(query), width: '*' },
  ];

  const productsTable: Table = {
    headerRows: 1,
    body: createProductsTableContent(data),
    widths: ['*', 'auto', 'auto'],
  };

  const documentDefinition: TDocumentDefinitions = {
    info,
    pageSize,
    pageMargins,
    content: [
      title,
      {
        margin: [0, 10],
        columns: headerColumns,
        style: MEDIUM,
      },
      {
        table: productsTable,
        margin: [0, 10],
        style: MEDIUM,
        layout: 'customLines',
        // layout: 'lightHorizontalLines',
      },
    ],
  };

  return pdfmakeConfigured().createPdf(documentDefinition);
}

function createHeaderLeftColumn({
  fromDate,
  toDate,
  customer,
}: ProductsQuery): Content[] {
  const currentDateRow: Content = {
    text: [
      'Atskaites datums: ',
      {
        text: format(new Date(), 'P p', { locale }),
        bold: true,
      },
    ],
  };
  const fromDateRow: Content = {
    text: [
      'No: ',
      {
        text: formatDate(fromDate),
        bold: true,
      },
    ],
  };
  const toDateRow: Content = {
    text: [
      'Līdz: ',
      {
        text: formatDate(toDate),
        bold: true,
      },
    ],
  };
  const customerRow: Content = {
    text: [
      'Klients: ',
      {
        text: customer ?? 'visi',
        bold: true,
      },
    ],
  };

  return [currentDateRow, fromDateRow, toDateRow, customerRow];
}

function createProductsTableContent(data: JobsProductsTotals[]): TableCell[][] {
  const tableHeader: TableCell[] = [
    {
      text: 'Izstrādājums',
      bold: true,
      // verticalAlignment: 'bottom',
    },
    {
      bold: true,
      alignment: 'right',
      stack: ['Darbu', 'skaits'],
    },
    {
      stack: ['Izstrādājumu', 'skaits'],
      alignment: 'right',
      bold: true,
    },
  ] as TableCell[];
  const tableRows = data.map((d) => createTableRow(d));

  return [tableHeader, ...tableRows];
}

function createTableRow(data: JobsProductsTotals): TableCell[] {
  return [
    data.name,
    { text: data.count, alignment: 'right' },
    { text: `${data.sum} ${data.units}`, alignment: 'right' },
  ];
}

function formatDate(d: Date | undefined): string {
  return d ? format(d, 'P', { locale }) : '-';
}
