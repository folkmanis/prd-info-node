import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import {
  Column,
  Content,
  ContentStack,
  Table,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces.js';
import { pdfMakeConfigured } from '../../../lib/pdf-make-configured.js';
import {
  RouteTrip,
  TransportationRouteSheet,
} from '../entities/route-sheet.entity.js';

function pluck<T extends object, K extends keyof T>(key: K) {
  return (obj: T) => obj[key];
}

export function transportationReport(
  routeSheet: TransportationRouteSheet,
  locale: Locale = lv,
): PDFKit.PDFDocument {
  const title = `Maršruta lapa ${routeSheet._id}`;

  const headerColumns: Column[] = [
    {
      stack: createHeaderLeftColumn(routeSheet, locale),
      width: '*',
    },
    {
      stack: createHeaderRightColumn(routeSheet),
      width: 'auto',
      alignment: 'right',
    },
  ];

  const routeTripsTable = createRouteTripsTable(routeSheet, locale);

  const documentDefinition: TDocumentDefinitions = {
    info: { title },
    pageSize: 'A4',
    pageMargins: [30, 30, 30, 30],
    defaultStyle: {
      fontSize: 10,
    },
    pageOrientation: 'landscape',
    content: [
      { text: title, fontSize: 14, bold: true, alignment: 'center' },
      {
        columns: headerColumns,
      },
      {
        table: routeTripsTable,
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 0],
      },
    ],
  };

  return pdfMakeConfigured().createPdfKitDocument(documentDefinition);
}

function createHeaderLeftColumn(
  { year, month, driver, vehicle }: TransportationRouteSheet,
  locale: Locale,
): Content[] {
  const periodRow: Content = {
    text: [
      { text: `${year}.`, bold: true },
      ' gada ',
      {
        text: format(new Date().setMonth(month - 1), 'LLLL', {
          locale,
        }),
        bold: true,
      },
    ],
  };
  const driverRow: Content = {
    text: ['Vadītājs: ', { text: driver.name, bold: true }],
  };
  const vehicleRow: Content = {
    text: [
      `Auto: ${vehicle.name} `,
      { text: vehicle.licencePlate, bold: true },
    ],
  };

  return [periodRow, driverRow, vehicleRow];
}

function createHeaderRightColumn(
  routeSheet: TransportationRouteSheet,
): Content[] {
  const fuelUnits = routeSheet.vehicle.fuelType.units;

  const fuelRemainingStartRow: Content = {
    text: [
      'Degvielas atlikums sākumā: ',
      {
        text: `${routeSheet.fuelRemainingStartLitres} ${fuelUnits}`,
        bold: true,
      },
    ],
  };
  const fuelReceivedRow: Content = {
    text: [
      'Saņemta degviela: ',
      { text: `${routeSheet.totalFuelPurchased()} ${fuelUnits}`, bold: true },
    ],
  };
  const fuelConsumedRow: Content = {
    text: [
      'Iztērēta degviela: ',
      { text: `${routeSheet.totalFuelConsumed()} ${fuelUnits}`, bold: true },
    ],
  };
  const fuelRemainingRow: Content = {
    text: [
      'Degvielas atlikums beigās: ',
      {
        text: `${routeSheet.fuelRemaining().toFixed(2)} ${fuelUnits}`,
        bold: true,
      },
    ],
  };
  return [
    fuelRemainingStartRow,
    fuelReceivedRow,
    fuelConsumedRow,
    fuelRemainingRow,
  ];
}

function createRouteTripsTableRows(
  routeSheet: TransportationRouteSheet,
  locale: Locale,
): TableCell[][] {
  const fuelUnits = routeSheet.vehicle.fuelType.units;

  const tableHeader: TableCell[] = [
    { text: 'Datums', bold: true },
    { text: 'Maršruts', bold: true },
    { text: 'Nobraukti (km)', alignment: 'right', bold: true },
    {
      text: `Patērētā degviela: (${fuelUnits})`,
      alignment: 'right',
      bold: true,
    },
  ];

  const tableRows: TableCell[][] = routeSheet.trips.map((trip) =>
    createRouteTripRow(trip, fuelUnits, locale),
  );

  const totalsRow: TableCell[] = [
    { text: 'Kopā/vidēji', bold: true, alignment: 'right', colSpan: 2 },
    {},
    {
      text: routeSheet.totalTripsLength().toFixed(0),
      bold: true,
      alignment: 'right',
    },
    {
      text: `${(routeSheet.averageConsumption() * 100).toFixed(1)} ${fuelUnits}/100km`,
      bold: true,
      alignment: 'right',
    },
  ];
  return [tableHeader, ...tableRows, totalsRow];
}

function createRouteTripRow(
  { date, stops, tripLengthKm, fuelConsumed, description }: RouteTrip,
  fuelUnits: string,
  locale: Locale,
): TableCell[] {
  const route: ContentStack = {
    stack: [
      { text: stops.map(pluck('name')).join(' - '), bold: true },
      { text: description, italics: true },
      { text: stops.map(pluck('address')).join(' - '), fontSize: 6 },
    ],
  };

  return [
    format(date, 'P', { locale }),
    route,
    { text: tripLengthKm.toFixed(0), alignment: 'right' },
    { text: `${fuelConsumed.toFixed(1)} ${fuelUnits}`, alignment: 'right' },
  ];
}

function createRouteTripsTable(
  routeSheet: TransportationRouteSheet,
  locale: Locale,
): Table {
  return {
    body: createRouteTripsTableRows(routeSheet, locale),
    layout: {
      paddingLeft: (i) => (i === 0 ? 0 : 4),
      paddingRight: (i, node) =>
        i === Number(node.table.widths?.length) - 1 ? 0 : 4,
      paddingTop: () => 4,
      paddingBottom: () => 4,
      vLineWidth: () => 0,
      hLineWidth: (i, node) =>
        i === 0 || i === 1 || (i && i >= node.table.body.length - 1) ? 2 : 1,
      hLineColor: (i, node) =>
        i === 0 || i === 1 || (i && i >= node.table.body.length - 1)
          ? '#000000'
          : '#606060',
    },
    widths: ['auto', '*', 'auto', 'auto'],
    headerRows: 1,
  };
}
