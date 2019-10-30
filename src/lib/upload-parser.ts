import { XmfArchiveInfo, XmfArchive } from './xmf-archive-class';
import { asyncQuery, MysqlPool } from '../lib/mysql-connector';
import mysql, { Pool, PoolConnection } from 'mysql';

class Record {
    constructor(
        public key: string,
        public val?: string | number | boolean,
    ) { }
}

export class UploadParser {
    records: Record[] = [];
    counter = 0;

    constructor(
        private connection: PoolConnection,
    ) { }


    parseLine(line: string) {
        line = line.trim();
        if (line.indexOf("%%N:") !== -1) // Ar %%N: saakas katrs jauns darbs
        {
            this.records = [];
        } else if (line[0] == '{') // Atverosaa figuuriekava noraada uz datu saakumu
        {
            this.records.push({ key: '{' });
        } else if (line[0] == '}') // Aizverošā figuuriekava noraada uz datu beigaam
        {
            this.records.push({ key: '}' });
        } else if (line.indexOf("%%E:") !== -1) { // Ar %%E: beidzas katrs jauns darbs

            // TODO beidz lasīt ierakstu
            // Saglabā sql dautbāzē
            // console.log(this.records);
            this.appendRecords();
        } else {
            const value = this.lineValue(line);
            if (value) {
                this.records.push(new Record(value.key, value.val));
            }
        }
    }

    private lineValue(line: string): { key: string, val: string | number | boolean } | null {
        line = this.removeBlanks(line);

        let k = line.indexOf(':');
        let l = line.indexOf('=');
        let m = line.lastIndexOf(';');
        if (k === -1) {
            return null;
        }
        const key = line.substring(0, k);
        let val: string | number | boolean = line.substring(l + 1, m);
        const type = line.substring(k + 1, l);
        // let val: string | number | boolean;
        switch (type) {
            case 'string':
                val = val; //.substring(1, val.length - 1);
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
     * Pārveido \ par \\
     * Atgriež jaunu teksta rindu
     * @param text teksts
     */
    private removeBlanks(text: string): string {
        /* Izņem liekos tukšumus */
        var block = false, tn = '';
        for (var i = 0; i < text.length; i++) {
            if (text[i] == ' ' && !block) {
                continue;
            }
            if (text[i] == '\"') {
                block = !block;
            }
            // if (block && text[i] == '/') {
            //     tn += "\\\\";
            // }
            else {
                tn += (text[i]);
            }
        }
        return tn;
    }

    private appendRecords() {
        const archiveInfo: XmfArchiveInfo = {}; // XmfArchiveInfo = new XmfArchiveInfo();
        let archive: { [key: string]: string | boolean | number } | null = null;
        for (const rec of this.records) {
            if (
                rec.key === 'DiArchive2Info' ||
                rec.key === '{'
            ) { continue; }
            if (rec.key === 'Archives') {
                // const archives: XmfArchive[] = [];
                // this.archiveInfo.Archives = archives;
                continue;
            }
            if (rec.key === 'DiArchive') {
                archive = {};
                archiveInfo.Archives = new Array<{ [key: string]: string | boolean | number }>();
                archiveInfo.Archives.push(archive);
                continue;
            }
            if (!rec.val) { continue; }
            if (archive) {
                archive[rec.key] = rec.val;
            } else {
                archiveInfo[rec.key] = rec.val;
            }
            if (rec.key === '}') {
                archive = null;
            }
        }
        if ((++this.counter % 100) === 0) {
            console.log(this.counter);
        }
        this.sqlInsert(archiveInfo);
    }

    async sqlInsert(archiveInfo: XmfArchiveInfo) {
        const keys = Object.getOwnPropertyNames(archiveInfo);
        let qqq = mysql.format('INSERT INTO xmf_archive_temp (??) VALUES (', [keys])
        let first2 = true;
        for (const k of keys) {
            if (!first2) {
                qqq += ',';
            }
            first2 = false;
            if (typeof archiveInfo[k] === 'object') {
                qqq += '\'' + JSON.stringify(archiveInfo[k]) + '\'';
            } else {
                qqq += mysql.escape(archiveInfo[k]);
            }
        }
        qqq += ')';
        await asyncQuery(this.connection, qqq);
    }

}