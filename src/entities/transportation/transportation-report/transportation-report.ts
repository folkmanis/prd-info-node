import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import {
  DocumentDefinition,
  Txt,
  Columns,
  Stack,
  Table,
} from 'pdfmake-wrapper/server/index.js';
import { pdfMakeConfigured } from '../../../lib/pdf-make-configured.js';
import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';

function pluck<T extends object, K extends keyof T>(key: K) {
  return (obj: T) => obj[key];
}

export function transportationReport(
  routeSheet: TransportationRouteSheet,
  locale: Locale = lv,
): PDFKit.PDFDocument {
  const title = `Maršruta lapa ${routeSheet._id}`;

  const headerLeftColumn = [
    new Txt([
      new Txt(`${routeSheet.year}.`).bold().end,
      ' gada ',
      new Txt(
        format(new Date().setMonth(routeSheet.month - 1), 'LLLL', { locale }),
      ).bold().end,
    ]).end,
    new Txt(['Vadītājs: ', new Txt(routeSheet.driver.name).bold().end]).end,
    new Txt([
      'Auto: ',
      `${routeSheet.vehicle.name} `,
      new Txt(routeSheet.vehicle.licencePlate).bold().end,
    ]).end,
  ];

  const fuelUnits = () => new Txt(routeSheet.vehicle.fuelType.units);

  const headerRightColumn = [
    new Txt([
      'Degvielas atlikums sākumā: ',
      new Txt(routeSheet.fuelRemainingStartLitres + ' ').bold().end,
      fuelUnits().bold().end,
    ]).end,
    new Txt([
      'Saņemta degviela: ',
      new Txt(routeSheet.totalFuelPurchased() + ' ').bold().end,
      new Txt(routeSheet.fuelUnits()).bold().end,
    ]).end,
    new Txt([
      'Iztērēta degviela: ',
      new Txt(routeSheet.totalFuelConsumed() + ' ').bold().end,
      fuelUnits().bold().end,
    ]).end,
    new Txt([
      'Degvielas atlikums beigās: ',
      new Txt(routeSheet.fuelRemaining() + ' ').bold().end,
      fuelUnits().bold().end,
    ]).end,
  ];

  const routeTripsTable = () => {
    const tableHeader = [
      new Txt('Datums').bold().end,
      new Txt('Maršruts').bold().end,
      new Txt('Nobraukti (km)').alignment('right').bold().end,
      new Txt(['Patērētā degviela ', '(', fuelUnits().end, ')'])
        .alignment('right')
        .bold().end,
    ];

    const tableRows = routeSheet.trips.map(
      ({ date, stops, tripLengthKm, fuelConsumed, description }) => [
        format(date, 'P', { locale }),
        new Stack([
          new Txt(stops.map(pluck('name')).join(' - ')).bold().end,
          new Txt(description).italics().end,
          new Txt(stops.map(pluck('address')).join(' - ')).fontSize(6).end,
        ]).end,
        new Txt(tripLengthKm.toFixed(0)).alignment('right').end,
        new Txt([fuelConsumed.toFixed(1), ' ', fuelUnits().end]).alignment(
          'right',
        ).end,
      ],
    );

    const totalsRow = [
      '',
      new Txt('Kopā/vidēji').bold().alignment('right').end,
      new Txt(routeSheet.totalTripsLength().toFixed(0))
        .bold()
        .alignment('right').end,
      new Txt([
        (routeSheet.averageConsumption() * 100).toFixed(1),
        ' ',
        fuelUnits().end,
        '/100km',
      ])
        .bold()
        .alignment('right').end,
    ];

    return new Table([tableHeader, ...tableRows, totalsRow])
      .layout({
        paddingLeft: (i) => (i === 0 ? 0 : 4),
        paddingRight: (i, node) => (i === node.table.widths.length - 1 ? 0 : 4),
        paddingTop: () => 4,
        paddingBottom: () => 4,
        vLineWidth: () => 0,
        hLineWidth: (i, node) =>
          i === 0 || i === 1 || (i && i >= node.table.body.length - 1) ? 2 : 1,
        hLineColor: (i, node) =>
          i === 0 || i === 1 || (i && i >= node.table.body.length - 1)
            ? '#000000'
            : '#606060',
      })
      .widths(['auto', '*', 'auto', 'auto'])
      .headerRows(1)
      .margin([0, 16, 0, 0]);
  };

  const pdf = new DocumentDefinition();
  pdf.pageSize('A4');
  pdf.pageOrientation('landscape');
  pdf.pageMargins([30, 30, 30, 30]);
  pdf.info({ title });
  pdf.defaultStyle({
    fontSize: 10,
  });

  pdf.add(new Txt(title).fontSize(14).bold().alignment('center').end);
  pdf.add(
    new Columns([
      new Stack(headerLeftColumn).width('*').end,
      new Stack(headerRightColumn).width('auto').alignment('right').end,
    ]).end,
  );
  pdf.add(routeTripsTable().end);

  return pdfMakeConfigured().createPdfKitDocument(pdf.getDefinition());
}
