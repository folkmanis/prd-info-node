import { JobMessage } from './job-message.js';
import { XmfUploadMessage } from './xmf-upload-message.js';

export type Message = JobMessage | XmfUploadMessage;
