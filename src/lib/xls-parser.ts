import * as XLSX from 'xlsx';

type InputDataTypes = 'binary' | 'buffer' | 'string' | 'array';

export function parseXls(data: any, type: InputDataTypes = 'binary'): any[][] {

    const wb: XLSX.WorkBook = XLSX.read(data, { type });

    /* grab first sheet */
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    /* save data */
    return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as [][];

}
