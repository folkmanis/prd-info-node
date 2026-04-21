import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import {
  Alignment,
  Content,
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
import { JobsSystemPreference } from '../../../preferences/interfaces/system-preferences.interface.js';
import { JobQuery } from '../dto/job-query.js';
import { JobsProductsTotals } from '../dto/jobs-products-totals.js';
import { JobOneProduct } from '../entities/job-one-product.js';

const SMALL: Style = { fontSize: 8 };
const MEDIUM: Style = { fontSize: 10, lineHeight: 1.2 };
const TITLE: Style = { fontSize: 14, bold: true };

class CContent {
  protected _text: Content;
  #bold?: boolean;
  #alignment?: Alignment;
  wordBreak?: Style['wordBreak'];
  fontSize?: number;

  constructor(text: Content) {
    this._text = text;
  }

  bold() {
    this.#bold = true;
    return this;
  }

  right() {
    this.#alignment = 'right';
    return this;
  }

  end(): Content {
    const content: Content = { text: this._text };
    if (this.#bold) {
      content.bold = this.#bold;
    }
    if (this.#alignment) {
      content.alignment = this.#alignment;
    }
    return content;
  }
}

export function content(text: Content) {
  return new CContent(text);
}

export function border(
  values: [boolean, boolean, boolean, boolean],
): (cell: TableCell) => TableCell {
  return (cell) => {
    if (Array.isArray(cell)) {
      return { stack: cell, border: values };
    }
    if (typeof cell === 'object') {
      return { ...cell, border: values } as TableCell;
    }
    return { text: cell, border: values };
  };
}

let locale = lv;

function formatDate(d: Date | undefined): string {
  return d ? format(d, 'P', { locale }) : '-';
}

export function jobsReport(
  query: JobQuery,
  jobs: JobOneProduct[],
  totals: JobsProductsTotals[],
  preferences: JobsSystemPreference,
  l?: Locale,
) {
  if (l) {
    locale = l;
  }

  const pageSize: PageSize = 'A4';
  const pageMargins: Margins = [30, 30, 30, 30];
  const info: TDocumentInformation = { title: `Darbu atskaite` };

  const titleStr = `Darbu saraksts`;
  const title: ContentText = { text: titleStr, style: TITLE };

  const documentDefinition: TDocumentDefinitions = {
    info,
    pageSize,
    pageMargins,
    content: [
      title,
      {
        margin: [0, 10],
        columns: [{ stack: createHeaderLeftColumn(query, preferences) }],
        style: MEDIUM,
      },
      {
        margin: [0, 10],
        style: MEDIUM,
        layout: 'customLinesWithFooter',
        table: totalsTable(totals),
      },
      {
        margin: [0, 10],
        style: MEDIUM,
        layout: 'customLines',
        table: jobsTable(jobs, preferences.jobStates),
      },
    ],
  };

  return pdfmakeConfigured().createPdf(documentDefinition);
}

function createHeaderLeftColumn(
  query: JobQuery,
  preferences: JobsSystemPreference,
): Content[] {
  const { fromDate, toDate, customer, jobsId, name, productsName } = query;
  const result = [] as Content[];
  result.push({
    text: [
      'Atskaites datums: ',
      content(format(new Date(), 'P p', { locale }))
        .bold()
        .end(),
    ],
  });
  result.push({
    text: ['No: ', content(formatDate(fromDate)).bold().end()],
  });
  result.push({
    text: ['Līdz: ', content(formatDate(toDate)).bold().end()],
  });
  result.push({
    text: [
      'Klients: ',
      content(customer ?? 'visi')
        .bold()
        .end(),
    ],
  });
  result.push({
    text: [
      'Stadija: ',
      content(query.statusDescriptions(preferences.jobStates).join(', '))
        .bold()
        .end(),
    ],
  });
  if (jobsId && jobsId.length > 0) {
    result.push({
      text: [
        'Iekļautie darbi: ',
        content(jobsId.map((jid) => jid.toString()).join(', '))
          .bold()
          .end(),
      ],
    });
  }
  if (name) {
    result.push({
      text: ['Nosaukums satur: ', content(`"${name}"`).bold().end()],
    });
  }
  if (productsName) {
    result.push({
      text: ['Izstrādājums: ', content(productsName).bold().end()],
    });
  }

  return result;
}

function totalsTable(totals: JobsProductsTotals[]): Table {
  const tableHeader: TableCell[] = [
    content('Izstrādājuma nosaukums').bold().end(),
    content('Darbu skaits').bold().right().end(),
    { text: 'Kopskaits', bold: true },
    { text: '', bold: true },
  ];
  const tableRows: TableCell[][] = totals.map((t) => [
    content(t.name ?? '').end(),
    content(t.count).right().end(),
    content(t.sum).right().end(),
    content(t.units).end(),
  ]);
  const footerRow: TableCell[] = [
    content('Kopā:').bold().right().end(),
    content(totals.map((t) => t.count).reduce((acc, curr) => acc + curr))
      .bold()
      .right()
      .end(),
    content(totals.map((t) => t.sum).reduce((acc, curr) => acc + curr))
      .bold()
      .right()
      .end(),
    '',
  ];
  return {
    body: [tableHeader, ...tableRows, footerRow],
    headerRows: 1,
    widths: ['*', 'auto', 'auto', 'auto'],
  };
}

function jobsTable(
  jobs: JobOneProduct[],
  states: JobsSystemPreference['jobStates'],
): Table {
  const tableHeader: TableCell[] = [
    content('Nr.').bold().end(),
    content('Klients').bold().end(),
    content('Datums').bold().end(),
    content('Nosaukums').bold().end(),
    content('Izstrādājums').bold().end(),
    content('Skaits').bold().end(),
    content('Stadija').bold().end(),
  ];
  const tableRows: TableCell[][] = [];
  for (const job of jobs) {
    tableRows.push(
      [
        content(job.jobId.toString()).end(),
        content(job.customer).end(),
        content(formatDate(job.receivedDate)).end(),
        content(job.name.replace(/([-_])/g, '\u200B$1')).end(),
        content(job.products.name).end(),
        content(`${job.products.count} ${job.products.units}`).end(),
        content(
          getStatusDescription(job.jobStatus.generalStatus, states),
        ).end(),
      ].map(border([false, true, false, false])),
    );
    if (job.comment) {
      tableRows.push([
        {
          text: job.comment,
          style: SMALL,
          colSpan: 7,
          border: [false, false, false, true],
        },
      ]);
    }
  }
  return {
    body: [tableHeader, ...tableRows],
    headerRows: 1,
    widths: ['auto', '20%', 'auto', '*', '20%', '10%', 'auto'],
  };
}

function getStatusDescription(
  state: number,
  states: JobsSystemPreference['jobStates'],
): string {
  return states.find((s) => s.state === state)?.description ?? state.toString();
}
