import { SystemModules } from '../../preferences';


export abstract class MessageBase {
    abstract readonly module: SystemModules;

    timestamp: Date;
    seenBy: string[] = [];
    deletedBy: string[] = [];

    constructor() {
        this.timestamp = new Date();
    }
}
