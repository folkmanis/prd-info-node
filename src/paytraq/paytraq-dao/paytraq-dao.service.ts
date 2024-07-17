import { Injectable } from '@nestjs/common';
import { URL } from 'url';
import https from 'https';
import { IncomingMessage } from 'http';
import {
  PaytraqClients,
  PaytraqClient,
  ShippingAddress,
  ShippingAddresses,
} from '../interfaces/client.js';
import { PaytraqProduct, PaytraqProducts } from '../interfaces/product.js';
import { PaytraqSales, PaytraqSale } from '../interfaces/sale.js';
import { RequestParameters } from '../interfaces/request-parameters.js';
import { PaytraqSystemPreference } from '../../preferences/interfaces/system-preferences.interface.js';
import { xmlToJs, Options, jsToXml } from './xml-converter.js';
import { ApiURLWithQuery } from './api-url-with-query.js';
import { ApiURL } from './api-url.class.js';
import { PreferencesService } from '../../preferences/index.js';
import { SalesInput } from '../interfaces/sales-input.js';

const CLIENT_OPTIONS: Options = { stringFields: ['RegNumber', 'Zip', 'Phone'] };
const SALE_OPTIONS: Options = {
  stringFields: ['DocumentRef', 'ClientName', 'WarehouseName', 'Zip', 'Phone'],
};
const RX_INTERVAL = 1000; // minimum ms between requests;

@Injectable()
export class PaytraqDaoService {
  private reqTime = 0;

  private async params(): Promise<PaytraqSystemPreference> {
    return this.preferencesService.getModuleSystemPreferences(
      'paytraq',
    ) as Promise<PaytraqSystemPreference>;
  }

  constructor(private preferencesService: PreferencesService) {}

  async getClients(query: RequestParameters): Promise<PaytraqClients> {
    const params = await this.params();
    const url = new ApiURLWithQuery(params, query, 'clients');

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) =>
        xmlToJs<PaytraqClients>(xml, {
          ...CLIENT_OPTIONS,
          forceArray: ['Client'],
        }),
      );
  }

  async getClient(clientId: number): Promise<PaytraqClient> {
    const params = await this.params();
    const url = new ApiURL(params, 'client', clientId.toString());

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) => xmlToJs<PaytraqClient>(xml, CLIENT_OPTIONS));
  }

  async getClientShippingAddresses(
    clientId: number,
  ): Promise<ShippingAddresses> {
    const params = await this.params();
    const url = new ApiURL(
      params,
      'client',
      'shippingAddresses',
      clientId.toString(),
    );

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) =>
        xmlToJs<ShippingAddresses>(xml, { forceArray: ['ShippingAddresses'] }),
      );
  }

  async getProducts(query: RequestParameters): Promise<PaytraqProducts> {
    const params = await this.params();
    const url = new ApiURLWithQuery(params, query, 'products');

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) =>
        xmlToJs<PaytraqProducts>(xml, { forceArray: ['Product'] }),
      );
  }

  async getProduct(productId: number): Promise<PaytraqProduct> {
    const params = await this.params();
    const url = new ApiURL(params, 'product', productId.toString());

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) => xmlToJs<PaytraqProduct>(xml));
  }

  async getSales(query: RequestParameters): Promise<PaytraqSales> {
    const params = await this.params();
    const url = new ApiURLWithQuery(params, query, 'sales');

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) =>
        xmlToJs<PaytraqSales>(xml, { ...SALE_OPTIONS, forceArray: ['Sale'] }),
      );
  }

  async getSale(saleId: number): Promise<PaytraqSale> {
    const params = await this.params();
    const url = new ApiURL(params, 'sale', saleId.toString());

    return this.delay()
      .then(httpsGetPromise(url))
      .then(retrieveData)
      .then((xml) =>
        xmlToJs<PaytraqSale>(xml, {
          ...SALE_OPTIONS,
          forceArray: ['LineItem', 'CustomField', 'Adjustment'],
        }),
      );
  }

  async postSale(sale: SalesInput): Promise<{ [key: string]: any }> {
    const params = await this.params();
    const url = new ApiURL(params, 'sale');
    const xml = jsToXml(sale);
    return this.delay()
      .then(httpsPostPromise(url, xml))
      .then(retrieveData)
      .then((xml) => xmlToJs(xml));
  }

  private async delay(): Promise<void> {
    let remain = this.reqTime - Date.now() + RX_INTERVAL;
    remain = remain > 0 ? remain : 0;
    this.reqTime = Date.now();
    return new Promise((resolve) => {
      setTimeout(() => resolve(), remain);
    });
  }
}

function httpsPostPromise(
  url: URL,
  data: string | Buffer,
): () => Promise<IncomingMessage> {
  const options: https.RequestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
  };
  return () =>
    new Promise((resolve) => {
      const req = https.request(url, options, resolve);
      req.write(data);
      req.end();
    });
}

function httpsGetPromise(url: URL): () => Promise<IncomingMessage> {
  return () => new Promise((resolve) => https.get(url, resolve).end());
}

function retrieveData(message: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let xml = '';
    message.on('data', (chunk) => (xml += chunk));
    message.on('end', () => resolve(xml));
  });
}
