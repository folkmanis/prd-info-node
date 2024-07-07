import { MessageBase } from './message-base.js';
import { XmfUploadProgress } from '../../entities/xmf-search/entities/xmf-upload-progress.entity.js';

export class XmfUploadMessage extends MessageBase {
  readonly module = 'xmf-upload';

  constructor(public data: XmfUploadProgress) {
    super();
  }
}
