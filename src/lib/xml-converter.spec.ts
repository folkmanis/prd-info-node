import { xmlToJs } from './xml-converter';

const client = `<Client>
<ClientID>7249</ClientID>
<Name>Terra Virtuala, SIA</Name>
<Email></Email>
<Type>2</Type>
<Status>true</Status>
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
<FinancialData>
    <ContractNumber></ContractNumber>
    <CreditLimit>0</CreditLimit>
    <Deposit>100.00</Deposit>
    <Discount>0.00</Discount>
    <PayTerm>
        <PayTermType>1</PayTermType>
        <PayTermDays>10</PayTermDays>
    </PayTerm>
    <TaxKeys>
        <Products>
            <TaxKeyID></TaxKeyID>
            <TaxKeyName></TaxKeyName>
        </Products>
        <Services>
            <TaxKeyID></TaxKeyID>
            <TaxKeyName></TaxKeyName>
        </Services>
    </TaxKeys>
    <Warehouse>
        <WrhID></WrhID>
        <WrhName></WrhName>
    </Warehouse>
    <PriceGroup>
        <PriceGroupID>1476</PriceGroupID>
        <PriceGroupName>Mazumcena ,EUR</PriceGroupName>
    </PriceGroup>
</FinancialData>
<TimeStamps>
    <Created>2014-12-10T09:25:47Z</Created>
    <Updated>2020-11-27T09:54:26Z</Updated>
</TimeStamps>
</Client>`;

const clientObj = {
    client: {
        clientID: 7249,
        name: "Terra Virtuala, SIA",
        type: 2,
        status: true,
        regNumber: "40003559952",
        "vatNumber": "LV40003559952",
        "legalAddress": {
            "address": "Zeltiņu 8-7, Rīga",
            "zip": "LV-1035",
            "country": "LV"
        },
        "clientGroup": {

        },
        "financialData": {
            "creditLimit": 0,
            "deposit": 100,
            "discount": 0,
            "payTerm": {
                "payTermType": 1,
                "payTermDays": 10
            },
            "taxKeys": {
                "products": {
                },
                "services": {
                }
            },
            "warehouse": {
            },
            "priceGroup": {
                "priceGroupID": 1476,
                "priceGroupName": "Mazumcena ,EUR"
            }
        },
        "timeStamps": {
            "created": "2014-12-10T09:25:47Z",
            "updated": "2020-11-27T09:54:26Z"
        }
    }
};

describe('should convert xml to js object', () => {

    it('should parse text fields', () => {
        const obj = xmlToJs('<name>Terra Virtuala, SIA</name>');
        expect(obj).toStrictEqual({ name: 'Terra Virtuala, SIA' });
    });

    it('should lowercase first letter', () => {
        const obj = xmlToJs('<Name>Terra Virtuala, SIA</Name>');
        expect(obj).toStrictEqual({ name: 'Terra Virtuala, SIA' });
    });

    it('should parse number', () => {
        const js = xmlToJs('<name>456</name>');
        expect(js).toStrictEqual({ name: 456 });
    });

    it('should parse boolean', () => {
        const js = xmlToJs('<name>false</name>');
        expect(js).toStrictEqual({ name: false });
    });

    it('should not parse ignored key', () => {
        const js = xmlToJs('<RegNumber>456</RegNumber>', { stringFields: ['RegNumber'] });
        expect(js).toStrictEqual({ regNumber: '456' });
    });

    it('should parse array', () => {
        const js = xmlToJs('<client><RegNumber>456</RegNumber><RegNumber>457</RegNumber></client>');
        // console.log(js);
        expect(js).toStrictEqual({ client: { regNumber: [456, 457] } });
    });

    it('should parse sample xml to object', () => {
        const jsObj = xmlToJs(client, { stringFields: ['RegNumber', 'Zip', 'Phone'] });
        expect(jsObj).toStrictEqual(clientObj);
    });
});
