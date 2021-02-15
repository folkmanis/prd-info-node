import https from 'https';
import { URL, URLSearchParams } from 'url';
import { IncomingMessage } from 'http';
import { RequestOptions, PaytraqClients, PaytraqClient, PaytraqProduct, PaytraqProducts } from '../interfaces/paytraq';
import { PaytraqConnectionParams, PaytraqSystemPreference } from '../interfaces/preferences.interface';
import { xmlToJs, Options } from '../lib/xml-converter';

const CLIENT_OPTIONS = { stringFields: ['RegNumber', 'Zip', 'Phone'] };

export class PaytraqDAO {

    static async getClients(query: RequestOptions, params: PaytraqSystemPreference): Promise<PaytraqClients> {
        const url = new ApiURLWithQuery(params, query, 'clients');

        return httpsGetPromise(url)
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqClients>(xml, { ...CLIENT_OPTIONS, forceArray: ['Client'] }));
    }

    static async getClient(clientId: number, params: PaytraqSystemPreference): Promise<PaytraqClient> {
        const url = new ApiURL(params, 'client', clientId.toString());

        return httpsGetPromise(url)
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqClient>(xml, CLIENT_OPTIONS));
    }

    static async getProducts(query: RequestOptions, params: PaytraqSystemPreference): Promise<PaytraqProducts> {
        const url = new ApiURLWithQuery(params, query, 'products');

        return httpsGetPromise(url)
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqProducts>(xml, { forceArray: ['Product'] }));
    }

    static async getProduct(productId: number, params: PaytraqSystemPreference): Promise<PaytraqProduct> {
        const url = new ApiURL(params, 'product', productId.toString());

        return httpsGetPromise(url)
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqProduct>(xml));
    }

}

class ApiURL extends URL {
    constructor({ connectionParams }: PaytraqSystemPreference, ...path: string[]) {
        if (!connectionParams) {
            throw new Error('paytraq parameters not set');
        }
        const { apiUrl, apiKey, apiToken } = connectionParams;
        if (!apiUrl || !apiKey || !apiToken) { throw new Error('missing server info'); }
        super(path.join('/'), apiUrl);
        const params = new URLSearchParams({
            APIToken: apiToken,
            APIKey: apiKey,
        });
        this.search = params.toString();
    }
}

class ApiURLWithQuery extends ApiURL {
    constructor(prefs: PaytraqSystemPreference, { page, query }: RequestOptions, ...path: string[]) {
        super(prefs, ...path);
        if (page) { this.searchParams.append('page', page.toString()); }
        if (query) { this.searchParams.append('query', query); }
    }
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
