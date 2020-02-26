import { ArchiveJob } from './xmf-archive-class';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';
import Logger from './logger';

abstract class Data {
    closed: boolean = false;
    abstract add(key: string, val: any): void;
    abstract toObject(): { [key: string]: any; };
    abstract last(): Data;
    close() {
        const lo = this.last();
        if (lo === this || lo.closed) {
            this.closed = true;
            return;
        }
        lo.close();
    }
}

class DataObject extends Data {
    private el: Map<string, any> = new Map();
    private lastEl: any;
    closed = false;
    constructor() {
        super();
        this.lastEl = this;
    }

    public last(): Data {
        if (this.lastEl === this || !(this.lastEl instanceof Data) || this.lastEl.closed) {
            return this;
        } else {
            return this.lastEl.last();
        }
    }

    add(key: string, val: any) {
        const lo = this.last();
        if (lo !== this) {
            lo.add(key, val);
            return;
        }
        if (key === 'OBJECT') {
            this.lastEl = new DataObject();
        } else if (val === '[]') {
            this.lastEl = new DataArray();
        } else {
            this.lastEl = val;
        }
        this.el.set(key, this.lastEl);
    }

    toObject(): { [key: string]: any; } {
        const obj: { [key: string]: any; } = {};
        this.el.forEach((val, key) => {
            if (val instanceof Data) {
                obj[key] = val.toObject();
            } else {
                obj[key] = val;
            }
        });
        return obj;
    }

    clear() {
        this.el.clear();
        this.lastEl = this;
    }

}

class DataArray extends Data {
    private arr: any[];
    closed = false;
    constructor() {
        super();
        this.arr = [];
    }

    add(key: string, val: any): void {
        if (key === 'OBJECT') { // jauns objekts
            this.arr.push(new DataObject());
        } else {
            this.arr.push(val);
        }
    }

    toObject(): any[] {
        const obj: any[] = [];
        for (const el of this.arr) {
            if (el instanceof Data) {
                obj.push(el.toObject());
            } else {
                obj.push(el);
            }
        }
        return obj;
    }

    last(): Data {
        const lastEl = this.arr[this.arr.length - 1];
        if (lastEl instanceof Data && !lastEl.closed) {
            return lastEl.last();
        } else {
            return this;
        }
    }

}

export class UploadParser {
    private data = new DataObject();

    counter = 0;
    isfirst = true; // kamēr nav pievienots neviens elements
    count = {
        modified: 0,
        upserted: 0
    };

    async parseLine(line: string) {
        line = line.trim();
        if (line.startsWith("%%N:")) // Ar %%N: saakas katrs jauns darbs
        {
            this.data.clear();
            this.isfirst = true;
        } else if (line.startsWith("%%E:")) { // Ar %%E: beidzas katrs darbs
            await this.storeData();
        } else if (line[0] === '{' && !this.isfirst) // Atverosaa figuuriekava noraada uz datu saakumu
        {
            this.data.add('OBJECT', '');
        } else if (line[0] === '}') { // Aizverošā figuuriekava noraada uz datu beigaam
            this.data.close();
            if (line[1] === ';') {
                this.data.close();
            }
        } else {
            const value = this.lineValue(line); // Jābūt key: value pārim
            if (value) {
                this.data.add(value.key, value.val);
                this.isfirst = false;
            }
        }
    }

    private lineValue(line: string): { key: string, val: string | number | boolean; } | null {
        line = this.removeBlanks(line);

        let k = line.indexOf(':');
        let l = line.indexOf('=');
        let m = line.lastIndexOf(';');
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
            else {
                tn += (text[i]);
            }
        }
        return tn;
    }

    private indexDates(job: ArchiveJob) {
        if (!job.Archives) { return; }
        for (const arch of job.Archives) {
            const index = arch.Location.match(/(\d){4}\/(\d){2}(?=-(\w)+(\d)+)/); // /GADS/MĒNESIS
            if (index) {
                [arch.yearIndex, arch.monthIndex] = index[0].split('/').map(v => +v);
                continue; // Pilna sakritība
            }
            const indexY = arch.Location.match(/\/(\d){4}\//); // /GADS/ - daļēja sakritība
            if (indexY) {
                arch.yearIndex = +indexY[0].split('/')[1];
            }
        }
    }

    private async storeData() {
        const archiveJob: ArchiveJob = this.data.toObject() as ArchiveJob; // XmfArchiveInfo = new XmfArchiveInfo();
        this.indexDates(archiveJob); // uztaisa indeksu
        if ((++this.counter % 1000) === 0) {
            Logger.debug(this.counter.toString());
        }
        const result = await xmfSearchDAO.insertJob(archiveJob);
        this.count.modified += result.modified;
        this.count.upserted += result.upserted;
    }

}