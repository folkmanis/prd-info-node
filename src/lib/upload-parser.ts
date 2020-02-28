import { ArchiveJob, XmfUploadProgress } from './xmf-archive-class';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';
import Logger from './logger';
import { ObjectId } from 'mongodb';
import { file as tmpFile, FileResult } from 'tmp-promise';
import readline, { ReadLine } from 'readline';
import fs from 'fs';

const WRITE_CHUNK_SIZE = 100;

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

class UploadParser {
    constructor(private tracker: UploadProgressTracker) { }

    private data = new DataObject();
    private isfirst = true; // kamēr nav pievienots neviens elements
    buffer: ArchiveJob[] = [];

    parseLine(line: string) {
        this.tracker.line();
        line = line.trim();
        if (line.startsWith("%%N:")) // Ar %%N: saakas katrs jauns darbs
        {
            this.data.clear();
            this.isfirst = true;
        } else if (line.startsWith("%%E:")) { // Ar %%E: beidzas katrs darbs
            this.storeData();
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

    private storeData() {
        const archiveJob: ArchiveJob = this.data.toObject() as ArchiveJob; // XmfArchiveInfo = new XmfArchiveInfo();
        this.indexDates(archiveJob); // uztaisa indeksu
        this.buffer.push(archiveJob);
        this.tracker.processed();
    }

}

interface TotalCount {
    [key: string]: number,
    lines: number,  // apstrādātās rindiņas
    processed: number, // atrastie ieraksti
    modified: number, // izmainītie ieraksti
    upserted: number, // pievienotie ieraksti
}
export class UploadProgressTracker {
    private progress: Partial<XmfUploadProgress> = {
        count: {
            lines: 0,
            modified: 0,
            upserted: 0,
            processed: 0,
        }
    };
    /**
     * Procesēta jauna rindiņa
     */
    line(): void {
        this.progress.count!.lines++;
        if (this.progress.count!.lines % 100 === 0) {
            this.save();
        }
    }

    set state(_st: 'uploading' | 'parsing' | 'saving' | 'finished') {
        this.progress.state = _st;
        this.save();
    }
    get state(): 'uploading' | 'parsing' | 'saving' | 'finished' {
        return this.progress.state || 'uploading';
    }
    /** Apstrādāts ieraksts */
    processed(): void {
        this.progress.count!.processed++;
        if (this.progress.count!.processed % 100 === 0) {
            this.save();
        }
    }
    /** Inicializācija. Izveido ierakstu datubāzē */
    async start(inf: Partial<XmfUploadProgress>): Promise<ObjectId | undefined> {
        if (this.progress._id) { return this.progress._id; }
        this.progress = { ...this.progress, ...inf };
        this.progress.started = new Date(Date.now());
        this.progress.state = 'uploading';
        this.progress._id = (await xmfSearchDAO.startLog(this.progress)) || undefined;
        return this.progress._id;
    }
    /**
     * Palielina skaitītājus par iesūtītajām vienībām 
     * skaitītājs.vienība += cnt.vienība
     * @param cnt Skaitītāja papildinājums. Iesūtītās vērtības tiks pieskaitītas esošajām.
     */
    updateCount(cnt: Partial<TotalCount>): void {
        for (const key in cnt) {
            this.progress.count![key] += cnt[key] || 0;
        }
        this.save();
    }
    /**
     * Esošo skaitītāja stāvokli saglabā datubāzē
     */
    async save(): Promise<boolean> {
        if (!this.progress._id) { return false; }
        return await xmfSearchDAO.updateLog(this.progress);
    }
    /**
     * Ieraksta skaitītāja stāvokli un papildina ar finished lauku
     * finished = Date.now
     */
    async finish(): Promise<boolean> {
        this.progress.finished = new Date(Date.now());
        this.state = 'finished';
        if (!this.progress._id) { return false; }
        return await xmfSearchDAO.updateLog(this.progress);
    }

}

export class FileParser {

    constructor(
        private file: FileResult,
        private tracker: UploadProgressTracker,
    ) { }

    lineReader!: ReadLine;

    start() {
        const rl = readline.createInterface({ input: fs.createReadStream(this.file.path), crlfDelay: Infinity });
        const parser = new UploadParser(this.tracker);
        this.tracker.state = 'parsing';
        rl.on('line', line => {
            parser.parseLine(line);
        });
        rl.on('close', async () => {
            this.file.cleanup();
            await this.writeBuffer(parser.buffer);
            await this.tracker.finish();
        });
        return;
    }

    private async writeBuffer(buffer: ArchiveJob[]): Promise<void> {
        this.tracker.state = 'saving';
        const chunks = Math.floor(buffer.length / WRITE_CHUNK_SIZE);
        for (let n = 0; n < chunks; n++) {
            const chunk = buffer.slice(
                WRITE_CHUNK_SIZE * n,
                WRITE_CHUNK_SIZE * (n + 1)
            );
            const resp = await xmfSearchDAO.insertJob(chunk);
            this.tracker.updateCount(resp);
        }
        const resp = await xmfSearchDAO.insertJob(
            buffer.slice(WRITE_CHUNK_SIZE * chunks)
        );
        this.tracker.updateCount(resp);
    }

}
