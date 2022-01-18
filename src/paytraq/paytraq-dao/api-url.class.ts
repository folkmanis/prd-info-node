import { URL, URLSearchParams } from 'url';
import { PaytraqSystemPreference } from '../../preferences/interfaces/system-preferences.interface';

export class ApiURL extends URL {
  constructor(
    { connectionParams }: PaytraqSystemPreference,
    ...path: string[]
  ) {
    if (!connectionParams) {
      throw new Error('paytraq parameters not set');
    }
    const { apiUrl, apiKey, apiToken } = connectionParams;
    if (!apiUrl || !apiKey || !apiToken) {
      throw new Error('missing server info');
    }
    super(path.join('/'), apiUrl);
    const params = new URLSearchParams({
      APIToken: apiToken,
      APIKey: apiKey,
    });
    this.search = params.toString();
  }
}
