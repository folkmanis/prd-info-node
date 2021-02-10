/// <reference types="node" />

declare module 'objtree' {

    export default class ObjTree {
        parseXML(xml: string): { [key: string]: string; };
        writeXML(obj: { [key: string]: any; }): string;
        attr_prefix: string;
        force_array: string[] | null;
        soft_arrays: boolean;
    }

}
