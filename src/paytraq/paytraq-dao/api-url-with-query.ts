import { RequestParameters } from '../interfaces/request-parameters';
import { PaytraqSystemPreference } from '../../preferences/interfaces/system-preferences.interface';
import { ApiURL } from './api-url.class';

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
