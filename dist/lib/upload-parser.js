"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmf_searchDAO_1 = __importDefault(require("../dao/xmf-searchDAO"));
class Data {
    constructor() {
        this.closed = false;
    }
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
    constructor() {
        super();
        this.el = new Map();
        this.closed = false;
        this.lastEl = this;
    }
    last() {
        if (this.lastEl === this || !(this.lastEl instanceof Data) || this.lastEl.closed) {
            return this;
        }
        else {
            return this.lastEl.last();
        }
    }
    add(key, val) {
        const lo = this.last();
        if (lo !== this) {
            lo.add(key, val);
            return;
        }
        if (key === 'OBJECT') {
            this.lastEl = new DataObject();
        }
        else if (val === '[]') {
            this.lastEl = new DataArray();
        }
        else {
            this.lastEl = val;
        }
        this.el.set(key, this.lastEl);
    }
    toObject() {
        const obj = {};
        this.el.forEach((val, key) => {
            if (val instanceof Data) {
                obj[key] = val.toObject();
            }
            else {
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
    constructor() {
        super();
        this.closed = false;
        this.arr = [];
    }
    add(key, val) {
        if (key === 'OBJECT') { // jauns objekts
            this.arr.push(new DataObject());
        }
        else {
            this.arr.push(val);
        }
    }
    toObject() {
        const obj = [];
        for (const el of this.arr) {
            if (el instanceof Data) {
                obj.push(el.toObject());
            }
            else {
                obj.push(el);
            }
        }
        return obj;
    }
    last() {
        const lastEl = this.arr[this.arr.length - 1];
        if (lastEl instanceof Data && !lastEl.closed) {
            return lastEl.last();
        }
        else {
            return this;
        }
    }
}
class UploadParser {
    constructor() {
        this.data = new DataObject();
        this.counter = 0;
        this.isfirst = true; // kamēr nav pievienots neviens elements
        this.count = {
            modified: 0,
            upserted: 0
        };
    }
    parseLine(line) {
        return __awaiter(this, void 0, void 0, function* () {
            line = line.trim();
            if (line.startsWith("%%N:")) // Ar %%N: saakas katrs jauns darbs
             {
                this.data.clear();
                this.isfirst = true;
            }
            else if (line.startsWith("%%E:")) { // Ar %%E: beidzas katrs darbs
                yield this.storeData();
            }
            else if (line[0] === '{' && !this.isfirst) // Atverosaa figuuriekava noraada uz datu saakumu
             {
                this.data.add('OBJECT', '');
            }
            else if (line[0] === '}') { // Aizverošā figuuriekava noraada uz datu beigaam
                this.data.close();
                if (line[1] === ';') {
                    this.data.close();
                }
            }
            else {
                const value = this.lineValue(line); // Jābūt key: value pārim
                if (value) {
                    this.data.add(value.key, value.val);
                    this.isfirst = false;
                }
            }
        });
    }
    lineValue(line) {
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
        let val = line.substring(l + 1, m);
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
    removeBlanks(text) {
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
    indexDates(job) {
        if (!job.Archives) {
            return;
        }
        for (const arch of job.Archives) {
            const index = arch.Location.match(/(\d){4}\/(\d){2}(?=-(\w)+(\d)+)/); // GADS/MĒNESIS 2015/02  -(vārds)(skaitlis)
            if (!index) {
                continue;
            }
            [arch.yearIndex, arch.monthIndex] = index[0].split('/').map(v => +v);
        }
    }
    storeData() {
        return __awaiter(this, void 0, void 0, function* () {
            const archiveJob = this.data.toObject(); // XmfArchiveInfo = new XmfArchiveInfo();
            this.indexDates(archiveJob); // uztaisa indeksu
            if ((++this.counter % 1000) === 0) {
                console.log(this.counter);
            }
            const result = yield xmf_searchDAO_1.default.insertJob(archiveJob);
            this.count.modified += result.modified;
            this.count.upserted += result.upserted;
        });
    }
}
exports.UploadParser = UploadParser;
//# sourceMappingURL=upload-parser.js.map