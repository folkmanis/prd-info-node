import { ClientSession } from 'mongodb';

/**
 * A MongoDB WriteConcern, which describes the level of acknowledgement
 * requested from MongoDB for write operations.
 * @see https://mongodb.github.io/node-mongodb-native/3.6/api/global.html#WriteConcern
 */
interface WriteConcern {
    /**
     * requests acknowledgement that the write operation has
     * propagated to a specified number of mongod hosts
     * @default 1
     */
    w?: number | 'majority' | string;
    /**
     * requests acknowledgement from MongoDB that the write operation has
     * been written to the journal
     * @default false
     */
    j?: boolean;
    /**
     * a time limit, in milliseconds, for the write concern
     */
    wtimeout?: number;
}

declare module 'mongodb' {
    interface CommonOptions {
        session?: ClientSession;
        writeConcern?: WriteConcern;
    }
}
