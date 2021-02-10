import https from 'https';
import { URL, URLSearchParams } from 'url';
import { IncomingMessage } from 'http';
import { RequestOptions, PaytraqClients, PaytraqClient } from '../interfaces/paytraq';
import { PaytraqSystemPreference } from '../interfaces/preferences.interface';
import { xmlToJs, Options } from '../lib/xml-converter';

const CLIENT_OPTIONS = { stringFields: ['RegNumber', 'Zip', 'Phone'] };

export class PaytraqDAO {

    static async getClients({ page, query }: RequestOptions, params: PaytraqSystemPreference): Promise<PaytraqClients> {
        const url = createApiUrl(params, 'clients');
        if (page) { url.searchParams.append('page', page.toString()); }
        if (query) { url.searchParams.append('query', query); }

        return httpsGetPromise(url)
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqClients>(xml, { ...CLIENT_OPTIONS, forceArray: ['Client'] }));
    }

    static async getClient(clientId: number, params: PaytraqSystemPreference): Promise<PaytraqClient> {
        const url = createApiUrl(params, 'client', clientId.toString());

        return httpsGetPromise(url)
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqClient>(xml, CLIENT_OPTIONS));
    }

}

function createApiUrl({ apiUrl, apiKey, apiToken }: PaytraqSystemPreference, ...path: string[]): URL {
    if (!apiUrl || !apiKey || !apiToken) { throw new Error('missing server info'); }
    let url: URL = new URL(path.join('/'), apiUrl);
    const params = new URLSearchParams({
        APIToken: apiToken,
        APIKey: apiKey,
    });
    url.search = params.toString();
    return url;
}


function httpsGetPromise(url: URL): Promise<IncomingMessage> {
    return new Promise(
        resolve => https.get(url, resolve).end()
    );
}

function retrieveData(message: IncomingMessage): Promise<string> {
    return new Promise(
        resolve => {
            let xml = '';
            message.on('data', chunk => xml += chunk);
            message.on('end', () => resolve(xml));
        }
    );
}