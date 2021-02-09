import { parseStringPromise, Options } from 'xml2js';
import { parseNumbers, parseBooleans, firstCharLowerCase } from 'xml2js/lib/processors';

export class XmlObject {

    private _stringFields = ['regNumber', 'zip', 'phone'];

    private _options: Options = {
        explicitArray: false,
        async: true,
        emptyTag: undefined,
        valueProcessors: [
            parseBooleans,
            this._parseNumbers(this._stringFields),
        ],
        tagNameProcessors: [
            firstCharLowerCase,
        ]
    };

    constructor(
        private _xmlString: string
    ) { }

    async js(options?: Options): Promise<{ [key: string]: any; }> {
        options = Object.assign(this._options, options);
        const obj = await parseStringPromise(this._xmlString, options);
        return this._removeEmpty(obj);
    }

    private _removeEmpty(obj: { [key: string]: any; }): { [key: string]: any; } {
        return Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .reduce(
                (acc, [k, v]) => ({ ...acc, [k]: typeof v === 'object' ? this._removeEmpty(v) : v }),
                {}
            );
    }

    private _parseNumbers(ignore: string[]): (value: string, name: string) => string | number {
        return (value: string, name: string): string | number => {
            if (typeof value !== 'string' || isNaN(+value) || ignore.includes(name)) {
                return value;
            } else {
                return +value;
            }
        };
    }
}
