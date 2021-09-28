import { ArchiveJob } from '../entities/xmf-archive.interface';
import { DataObject } from './data-object.class';
import { Observable, Subject, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function linesToObject(): OperatorFunction<string, ArchiveJob> {
    return (observable: Observable<string>) =>
        new Observable(subscriber => {

            let data: DataObject | undefined;
            let isfirst = true;

            const subscription = observable.subscribe({
                next: line => {
                    line = line.trim();
                    if (line.startsWith('%%N:')) {
                        // Ar %%N: saakas katrs jauns darbs
                        data = new DataObject();
                        isfirst = true;
                    } else if (line.startsWith('%%E:')) {
                        // Ar %%E: beidzas katrs darbs
                        const archiveJob = data?.toObject() as ArchiveJob;
                        indexDates(archiveJob); // uztaisa indeksu
                        subscriber.next(archiveJob);
                        data = undefined;
                        return;
                    } else if (line[0] === '{' && !isfirst) {
                        // Atverosaa figuuriekava noraada uz datu saakumu
                        data?.add('OBJECT', '');
                    } else if (line[0] === '}') {
                        // Aizverošā figuuriekava noraada uz datu beigaam
                        data?.close();
                        if (line[1] === ';') {
                            data?.close();
                        }
                    } else {
                        const value = lineValue(line); // Jābūt key: value pārim
                        if (value) {
                            data?.add(value.key, value.val);
                            isfirst = false;
                        }
                    }
                },
                complete: () => subscriber.complete(),
                error: (err) => subscriber.error(err),
            });

            return () => {
                subscription.unsubscribe();
                data = undefined;
            };
        });
}


function lineValue(
    line: string,
): { key: string; val: string | number | boolean; } | null {
    line = removeBlanks(line);

    const k = line.indexOf(':');
    const l = line.indexOf('=');
    const m = line.lastIndexOf(';');
    if (k === -1 || l === -1) {
        return null;
    }
    const key = line.substring(0, k);
    const type = line.substring(k + 1, l);
    if (type.search(/OBJECT\[[0-9]+\]/) > -1) {
        return { key: key, val: '[]' };
    }
    let val: string | number | boolean = line.substring(l + 1, m);
    switch (type) {
        case 'string':
            val = val;
            break;
        case 'int':
            val = +val;
            break;
        case 'bool':
            val = !!val;
            break;
        default:
            val = val;
            break;
    }
    return { key, val };
}
/**
 * Izņem liekās atstarpes no rindas.
 * Atgriež jaunu teksta rindu
 * @param text teksts
 */
function removeBlanks(text: string): string {
    /* Izņem liekos tukšumus */
    let block = false,
        tn = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] == ' ' && !block) {
            continue;
        }
        if (text[i] == '"') {
            block = !block;
        } else {
            tn += text[i];
        }
    }
    return tn;
}

function indexDates(job: ArchiveJob) {
    if (!job?.Archives) {
        return;
    }
    for (const arch of job.Archives) {
        const index = arch.Location.match(/(\d){4}\/(\d){2}(?=-(\w)+(\d)+)/); // /GADS/MĒNESIS
        if (index) {
            [arch.yearIndex, arch.monthIndex] = index[0].split('/').map((v) => +v);
            continue; // Pilna sakritība
        }
        const indexY = arch.Location.match(/\/(\d){4}\//); // /GADS/ - daļēja sakritība
        if (indexY) {
            arch.yearIndex = +indexY[0].split('/')[1];
        }
    }
}
