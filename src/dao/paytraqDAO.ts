import https from 'https';
import { URL, URLSearchParams } from 'url';
import { IncomingMessage } from 'http';
import { RequestOptions, PaytraqClients, PaytraqClient, PaytraqProduct, PaytraqProducts, PaytraqSales, PaytraqSale } from '../interfaces/paytraq';
import { PaytraqConnectionParams, PaytraqSystemPreference } from '../interfaces/preferences.interface';
import { xmlToJs, Options, jsToXml } from '../lib/xml-converter';
import { method } from 'lodash';
import { Dao } from '../interfaces/dao.interface';

const CLIENT_OPTIONS: Options = { stringFields: ['RegNumber', 'Zip', 'Phone'] };
const SALE_OPTIONS: Options = { stringFields: ['DocumentRef', 'ClientName', 'WarehouseName', 'Zip', 'Phone'] };

const RX_INTERVAL = 1000; // minimum 500 ms between requests;

export class PaytraqDao extends Dao {

    private reqTime: number = 0;

    async injectDb() {
        return;
    }

    async getClients(query: RequestOptions, params: PaytraqSystemPreference): Promise<PaytraqClients> {
        const url = new ApiURLWithQuery(params, query, 'clients');

        return this.delay()
            .then(httpsGetPromise(url))
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqClients>(xml, { ...CLIENT_OPTIONS, forceArray: ['Client'] }));
    }

    async getClient(clientId: number, params: PaytraqSystemPreference): Promise<PaytraqClient> {
        const url = new ApiURL(params, 'client', clientId.toString());

        return this.delay()
            .then(httpsGetPromise(url))
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqClient>(xml, CLIENT_OPTIONS));
    }

    async getProducts(query: RequestOptions, params: PaytraqSystemPreference): Promise<PaytraqProducts> {
        const url = new ApiURLWithQuery(params, query, 'products');

        return this.delay()
            .then(httpsGetPromise(url))
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqProducts>(xml, { forceArray: ['Product'] }));
    }

    async getProduct(productId: number, params: PaytraqSystemPreference): Promise<PaytraqProduct> {
        const url = new ApiURL(params, 'product', productId.toString());
        return this.delay()
            .then(httpsGetPromise(url))
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqProduct>(xml));
    }

    async getSales(query: RequestOptions, params: PaytraqSystemPreference): Promise<PaytraqSales> {
        const url = new ApiURLWithQuery(params, query, 'sales');

        return this.delay()
            .then(httpsGetPromise(url))
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqSales>(xml, { ...SALE_OPTIONS, forceArray: ['Sale'] }));
    }

    async getSale(saleId: number, params: PaytraqSystemPreference): Promise<PaytraqSale> {
        const url = new ApiURL(params, 'sale', saleId.toString());

        return this.delay()
            .then(httpsGetPromise(url))
            .then(retrieveData)
            .then(xml => xmlToJs<PaytraqSale>(
                xml,
                { ...SALE_OPTIONS, forceArray: ['LineItem', 'CustomField', 'Adjustment'] }
            ));
    }

    async postSale(sale: Partial<PaytraqSale>, params: PaytraqSystemPreference): Promise<{ [key: string]: any; }> {
        const url = new ApiURL(params, 'sale');
        // const url = new URL('https://httpbin.org/post');
        const xml = jsToXml(sale);
        return this.delay()
            .then(httpsPostPromise(url, xml))
            .then(retrieveData)
            .then(xml => xmlToJs(xml));
    }

    async delay(): Promise<void> {
        let remain = this.reqTime - Date.now() + RX_INTERVAL;
        remain = remain > 0 ? remain : 0;
        this.reqTime = Date.now();
        return new Promise(resolve => {
            setTimeout(() => resolve(), remain);
        });
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

function httpsPostPromise(url: URL, data: string | Buffer): () => Promise<IncomingMessage> {
    const options: https.RequestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' }
    };
    return () => new Promise(
        resolve => {
            const req = https.request(url, options, resolve);
            req.write(data);
            req.end();
        }
    );
}

function httpsGetPromise(url: URL): () => Promise<IncomingMessage> {
    return () => new Promise(
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
