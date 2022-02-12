import { Injectable } from '@nestjs/common';
import sanitize from 'sanitize-filename';

export interface JobPathComponents {
  receivedDate: Date;
  custCode: string;
  jobId: number;
  name: string;
}

@Injectable()
export class FolderPathService {
  jobToPath({
    receivedDate,
    custCode,
    jobId,
    name,
  }: JobPathComponents): string[] {
    return [
      new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(
        receivedDate,
      ),
      this.toMonthNumberName(receivedDate),
      `${custCode}-Input`,
      `${jobId.toString()}-${this.sanitizeFileName(name)}`,
    ];
  }

  capitalize(s: string): string {
    if (typeof s !== 'string') {
      return '';
    }
    return s[0].toUpperCase() + s.slice(1);
  }

  sanitizeFileName(s: string): string {
    if (typeof s !== 'string') {
      return 'unknown';
    }
    return sanitize(this.removeDiactrics(s.trim()));
  }

  removeDiactrics(s: string): string {
    return s.normalize('NFKD').replace(/[\u0300-\u036F]/g, '');
  }

  toMonthNumberName(date: Date): string {
    return (
      new Intl.DateTimeFormat('lv', { month: '2-digit' }).format(date) +
      '-' +
      this.capitalize(
        this.removeDiactrics(
          new Intl.DateTimeFormat('lv', { month: 'long' }).format(date),
        ),
      )
    );
  }

  toDateString(date: Date): string {
    return new Intl.DateTimeFormat('lv').format(date);
  }
}
