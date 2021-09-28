import { MessageBase } from './message-base';
import { XmfUploadProgress } from '../../entities/xmf-search/entities/xmf-upload-progress.entity';

export class XmfUploadMessage extends MessageBase {
    readonly module = 'xmf-upload';

    constructor(
        public data: XmfUploadProgress,
    ) {
        super();
    }

}