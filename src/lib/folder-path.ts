import { JobBase } from '../interfaces';

export class FolderPath {

    static toArray(job: JobBase): string[] {
        const keys = ['receivedDate', 'custCode', 'jobId', 'name'] as (keyof JobBase)[];
        if (!keys.reduce((acc, key) => acc && !!job[key], true)) {
            return [];
        }
        const date: Date = new Date(job.receivedDate);
        return [
            new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date),
            this.toMonthNumberName(date),
            `${job.custCode}-Input`,
            `${job.jobId.toString()}-${this.removeDiactrics(job.name.trim())}`,
        ];
    }

    static capitalize(s: string): string {
        if (typeof s !== 'string') { return ''; }
        return s[0].toUpperCase() + s.slice(1);
    }

    static removeDiactrics(s: string): string {
        return s.normalize('NFKD').replace(/[\u0300-\u036F]/g, '');
    }

    static toMonthNumberName(date: Date): string {
        return new Intl.DateTimeFormat('lv', { month: '2-digit' }).format(date)
            + '-'
            + this.capitalize(this.removeDiactrics(new Intl.DateTimeFormat('lv', { month: 'long' }).format(date)));
    }

}
