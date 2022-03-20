import { Expose } from 'class-transformer';

export class MessagePartBody {
  attachmentId?: string;
  size: number;
  data?: string;

  @Expose()
  get decoded(): string | undefined {
    return this.data && Buffer.from(this.data, 'base64').toString();
  }
}
