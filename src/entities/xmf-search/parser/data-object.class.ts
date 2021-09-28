abstract class Data {
    closed = false;
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

export class DataObject extends Data {
    closed = false;

    private el: Map<string, any> = new Map();
    private lastEl: any;

    constructor() {
        super();
        this.lastEl = this;
    }

    last(): Data {
        if (
            this.lastEl === this ||
            !(this.lastEl instanceof Data) ||
            this.lastEl.closed
        ) {
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

}

class DataArray extends Data {

    closed = false;

    private arr: any[];

    constructor() {
        super();
        this.arr = [];
    }

    add(key: string, val: any): void {
        if (key === 'OBJECT') {
            // jauns objekts
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
