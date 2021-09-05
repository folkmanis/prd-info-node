export type Counters = 'lastJobId' | 'lastInvoiceId';

export interface CounterLastId {
  counter: Counters;
  lastId: number;
}
