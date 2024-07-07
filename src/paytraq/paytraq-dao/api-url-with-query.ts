import { RequestParameters } from '../interfaces/request-parameters.js';
import { PaytraqSystemPreference } from '../../preferences/interfaces/system-preferences.interface.js';
import { ApiURL } from './api-url.class.js';

export class ApiURLWithQuery extends ApiURL {
  constructor(
    prefs: PaytraqSystemPreference,
    { page, query }: RequestParameters,
    ...path: string[]
  ) {
    super(prefs, ...path);
    if (page) {
      this.searchParams.append('page', page.toString());
    }
    if (query) {
      this.searchParams.append('query', query);
    }
  }
}
