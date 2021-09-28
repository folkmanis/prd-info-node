import { JobMessage } from './job-message';
import { XmfUploadMessage } from './xmf-upload-message';

export type Message = JobMessage | XmfUploadMessage;
