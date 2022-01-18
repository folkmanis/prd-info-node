import { ObjectId } from 'mongodb';

class Count {
  lines = 0;
  modified = 0;
  upserted = 0;
  processed = 0;
}

export class XmfUploadProgress {
  _id = new ObjectId();
  state = 'finished' as const;
  count = new Count();
  fileName = '';
  fileSize = 0;
  username: string | undefined;
  started = new Date();
  finished: Date;
}
