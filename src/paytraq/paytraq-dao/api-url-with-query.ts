import { RequestParameters } from '../interfaces/request-parameters.schema.js';
import { ApiURL, ConnectionParams } from './api-url.class.js';

export class ApiURLWithQuery extends ApiURL {
  constructor(
    connectionParams: ConnectionParams,
    { page, query }: RequestParameters,
    ...path: string[]
  ) {
    super(connectionParams, ...path);
    if (page) {
      this.searchParams.append('page', page.toString());
    }
    if (query) {
      this.searchParams.append('query', query);
    }
  }
}
