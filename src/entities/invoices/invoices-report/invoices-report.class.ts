import { format, Locale } from 'date-fns';
import { lv } from 'date-fns/locale';
import { join } from 'path';
import Pdfmake from 'pdfmake';
import {
    Cell, DocumentDefinition,
    Table, Txt
} from 'pdfmake-wrapper/server';
import { InvoiceForReport, JobBase } from '../entities/invoice-for-report.interface';
import { InvoiceProduct } from '../entities/invoice.entity';


export class InvoiceReport {
    private pdf = new DocumentDefinition();
    private printer = new Pdfmake({
        Roboto: {
            normal: join(__dirname, 'fonts/Roboto-Regular.ttf'),
            bold: join(__dirname, 'fonts/Roboto-Bold.ttf'),
            italics: join(__dirname, 'fonts/Roboto-Italics.ttf'),
            bolditalics: join(__dirname, 'fonts/Roboto-MediumItalic.ttf'),
        },
    });

    constructor(private invoice: InvoiceForReport, private locale: Locale = lv) {
        this.pdf.pageSize('A4');
        this.pdf.pageMargins([30, 30, 30, 30]);
        this.pdf.info({ title: `Report ${invoice.invoiceId}` });
    }

    open() {
        const title =
            (this.invoice.customerInfo?.financial?.clientName ||
                this.invoice.customer) +
            (this.invoice.invoiceId ? ` / ${this.invoice.invoiceId}` : '');
        this.pdf.add(new Txt(title).fontSize(14).bold().end);
        this.pdf.add(
            new Table([
                ...this.createProductsTable(this.invoice.products),
                [
                    '',
                    '',
                    new Cell(new Txt('Kopā').bold().alignment('right').end).end,
                    new Cell(
                        new Txt(`${this.invoice.total?.toFixed(2) || 0} EUR`).bold().end,
                    ).alignment('right').end,
                ],
            ])
                .layout('lightHorizontalLines')
                .fontSize(10)
                .headerRows(1).end,
        );
        this.pdf.add(
            new Table(this.createJobsTable(this.invoice.jobs))
                .layout('lightHorizontalLines')
                .fontSize(8)
                .headerRows(1).end,
        );
        return this.printer.createPdfKitDocument(this.pdf.getDefinition());
    }

    private createProductsTable(products: InvoiceProduct[]): any[][] {
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

    private createJobsTable(jobs: JobBase[] = []): any[][] {
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
                format(new Date(job.receivedDate), 'P', { locale: this.locale }),
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
}
