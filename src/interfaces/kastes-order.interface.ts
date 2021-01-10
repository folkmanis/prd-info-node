import { ResponseBase } from './response-base.interface';
import { JobBase } from './job-base.interface';
import { Colors, Veikals } from './kastes.interface';

export interface ColorTotals {
    color: Colors;
    total: number;
}

export interface ApjomiTotals {
    apjoms: number;
    total: number;
}

export type KastesJob = JobBase & {
    category: 'perforated paper';
    isLocked: boolean; // ir izveidots pakošanas saraksts
    apjomsPlanned: ColorTotals[];
    totals: {
        veikali: number;
        colorTotals: ColorTotals[];
        apjomiTotals: ApjomiTotals[];
    };
    veikali: Veikals[];

};

export type KastesJobPartialKeys = 'jobId' | 'name' | 'receivedDate' | 'isLocked' | 'dueDate';

export type KastesJobPartial = Pick<KastesJob, KastesJobPartialKeys> & { veikaliCount?: number; };

export interface KastesJobResponse extends ResponseBase<KastesJob> { }
