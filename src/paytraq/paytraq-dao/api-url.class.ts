import { URL, URLSearchParams } from 'url';
import { assertCondition, assertNotNull } from '../../lib/assertions.js';

export type ConnectionParams = {
  apiUrl: string;
  apiKey: string;
  apiToken: string;
};

export class ApiURL extends URL {
  constructor(connectionParams: ConnectionParams, ...path: string[]) {
    const { apiUrl, apiKey, apiToken } = connectionParams;
    assertCondition(apiUrl && apiKey && apiToken, 'missing server info');
    super(path.join('/'), apiUrl);
    const params = new URLSearchParams({
      APIToken: apiToken,
      APIKey: apiKey,
    });
    this.search = params.toString();
  }
}
