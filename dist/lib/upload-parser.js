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
const xmf_archive_class_1 = require("./xmf-archive-class");
const mysql_connector_1 = require("../lib/mysql-connector");
const mysql_1 = __importDefault(require("mysql"));
class Record {
    constructor(key, val) {
        this.key = key;
        this.val = val;
    }
}
class UploadParser {
    constructor(connection, mongo) {
        this.connection = connection;
        this.mongo = mongo;
        this.records = [];
        this.counter = 0;
        this.archiveJob = this.mongo.model('xmfArchive', xmf_archive_class_1.ArchiveJobSchema);
    }
    parseLine(line) {
        line = line.trim();
        if (line.indexOf("%%N:") !== -1) // Ar %%N: saakas katrs jauns darbs
         {
            this.records = [];
        }
        else if (line[0] == '{') // Atverosaa figuuriekava noraada uz datu saakumu
         {
            this.records.push({ key: '{' });
        }
        else if (line[0] == '}') // Aizverošā figuuriekava noraada uz datu beigaam
         {
            this.records.push({ key: '}' });
        }
        else if (line.indexOf("%%E:") !== -1) { // Ar %%E: beidzas katrs jauns darbs
            // TODO beidz lasīt ierakstu
            // Saglabā sql dautbāzē
            // console.log(this.records);
            this.appendRecords();
        }
        else {
            const value = this.lineValue(line);
            if (value) {
                this.records.push(new Record(value.key, value.val));
            }
        }
    }
    lineValue(line) {
        line = this.removeBlanks(line);
        let k = line.indexOf(':');
        let l = line.indexOf('=');
        let m = line.lastIndexOf(';');
        if (k === -1) {
            return null;
        }
        const key = line.substring(0, k);
        let val = line.substring(l + 1, m);
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
            // if (block && text[i] == '/') {
            //     tn += "\\\\";
            // }
            else {
                tn += (text[i]);
            }
        }
        return tn;
    }
    appendRecords() {
        const archiveInfo = {}; // XmfArchiveInfo = new XmfArchiveInfo();
        let archive = null;
        for (const rec of this.records) {
            if (rec.key === 'DiArchive2Info' ||
                rec.key === '{') {
                continue;
            }
            if (rec.key === 'Archives') {
                // const archives: XmfArchive[] = [];
                // this.archiveInfo.Archives = archives;
                continue;
            }
            if (rec.key === 'DiArchive') {
                archive = {};
                archiveInfo.Archives = new Array();
                archiveInfo.Archives.push(archive);
                continue;
            }
            if (!rec.val) {
                continue;
            }
            if (archive) {
                archive[rec.key] = rec.val;
            }
            else {
                archiveInfo[rec.key] = rec.val;
            }
            if (rec.key === '}') {
                archive = null;
            }
        }
        if ((++this.counter % 100) === 0) {
            console.log(this.counter);
        }
        const job = new this.archiveJob(archiveInfo);
        job.save((err, result) => {
            if (err) {
                console.error('db save error');
            }
            // console.log(result);
        });
        // this.sqlInsert(archiveInfo);
        // console.log(archiveInfo);
    }
    sqlInsert(archiveInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = Object.getOwnPropertyNames(archiveInfo);
            let qqq = mysql_1.default.format('INSERT INTO xmf_archive_temp (??) VALUES (', [keys]);
            let first2 = true;
            for (const k of keys) {
                if (!first2) {
                    qqq += ',';
                }
                first2 = false;
                if (typeof archiveInfo[k] === 'object') {
                    qqq += '\'' + JSON.stringify(archiveInfo[k]) + '\'';
                }
                else {
                    qqq += mysql_1.default.escape(archiveInfo[k]);
                }
            }
            qqq += ')';
            yield mysql_connector_1.asyncQuery(this.connection, qqq);
        });
    }
}
exports.UploadParser = UploadParser;
//# sourceMappingURL=upload-parser.js.map