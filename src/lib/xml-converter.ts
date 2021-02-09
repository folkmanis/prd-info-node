import { parseStringPromise, Options } from 'xml2js';
import { parseNumbers, parseBooleans, firstCharLowerCase } from 'xml2js/lib/processors';
// import { ObjTree } from 'objtree';

import ObjTree from 'objtree';

export class XmlObject {

    private _stringFields = ['regNumber', 'zip', 'phone'];

    objTree = new ObjTree();

    constructor(
        private _xmlString: string
    ) { }

    js(): { [key: string]: any; } {
        const obj = this.objTree.parseXML(this._xmlString);
        return this._clearObject(obj);
    }

    private _clearObject(obj: { [key: string]: any; }): { [key: string]: any; } {
        return Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(this._keyLowerFirstLetter)
            .map(this._parseNumbers(this._stringFields))
            .map(this._parseBoolean)
            .reduce(
                (acc, [k, v]) => ({ ...acc, [k]: typeof v === 'object' ? this._clearObject(v) : v }),
                {}
            );
    }

    private _parseNumbers(ignore: string[]): ([key, value]: [string, string]) => [string, string | number] {
        return ([key, value]) => {
            if (typeof value !== 'string' || isNaN(+value) || ignore.includes(key)) {
                return [key, value];
            } else {
                return [key, +value];
            }
        };
    }

    private _keyLowerFirstLetter<T>([key, value]: [string, T]): [string, T] {
        return [key[0].toLowerCase() + key.substr(1), value];
    }

    private _parseBoolean<T extends string | number>([key, value]: [string, T]): [string, T | boolean] {
        if (value === 'false') { return [key, false]; }
        if (value === 'true') { return [key, true]; }
        return [key, value];
    }
}
