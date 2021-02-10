import { XmlValidators } from './paytraq-validator';
import { xmlToJs, Options } from '../xml-converter';
import { PaytraqClient } from '../../interfaces';

const client = `
<Client>
    <ClientID>7249</ClientID>
    <Name>Terra Virtuala, SIA</Name>
    <Email></Email>
    <Type>2</Type>
    <Status>2</Status>
    <RegNumber>40003559952</RegNumber>
    <VatNumber>LV40003559952</VatNumber>
    <LegalAddress>
        <Address>Zeltiņu 8-7, Rīga</Address>
        <Zip>LV-1035</Zip>
        <Country>LV</Country>
    </LegalAddress>
    <Phone></Phone>
    <ClientGroup>
        <GroupID></GroupID>
        <GroupName></GroupName>
    </ClientGroup>
    <TimeStamps>
        <Created>2014-12-10T09:25:47Z</Created>
        <Updated>2020-11-27T09:54:26Z</Updated>
    </TimeStamps>
</Client>
`;

const clientArr = `<Clients>` + client + client + `</Clients>`;
const singleClientArr = `<Clients>` + client + `</Clients>`;

describe('should convert and validate xml', () => {

    const opt1: Options = {
        stringFields: ['RegNumber', 'Zip', 'Phone']
    };
    const opt2: Options = {
        forceArray: ['Client'],
        stringFields: ['RegNumber', 'Zip', 'Phone']
    };

    it('clients', () => {
        const obj = xmlToJs<PaytraqClient>(client, opt1);
        const validate = XmlValidators.client(obj);
        expect(XmlValidators.client.errors).toBeNull();
    });

    it('clients array', () => {
        const obj = xmlToJs(clientArr, opt2);
        const validate = XmlValidators.clients(obj);
        expect(XmlValidators.client.errors).toBeNull();
    });

    it('single clients array', () => {
        const obj = xmlToJs(singleClientArr, opt2);
        console.log(obj);
        const validate = XmlValidators.clients(obj);
        expect(XmlValidators.client.errors).toBeNull();
    });

    xit('single clients array', () => {
        const obj = xmlToJs(singleClientArr, opt2);
        const validate = XmlValidators.clients(obj);
        // console.log(XmlValidators.client.errors);
        expect(XmlValidators.client.errors).toBeTruthy();
    });
});
