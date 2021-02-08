import { XmlObject } from './xml-converter';

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
    let xmlObject = new XmlObject(client);
    it('should create a object', () =>
        expect(xmlObject).toBeDefined());

    it('should parse sample xml to object', async () => {
        const jsObj = await xmlObject.js();
        expect(jsObj).toBeInstanceOf(Object);
    });

    it('should parse text fields', async () => {
        const obj = new XmlObject('<name>Terra Virtuala, SIA</name>');
        const js = await obj.js();
        expect(js).toStrictEqual({ name: 'Terra Virtuala, SIA' });
    });

    it('should lowercase first letter', async () => {
        const obj = new XmlObject('<Name>Terra Virtuala, SIA</Name>');
        const js = await obj.js();
        expect(js).toStrictEqual({ name: 'Terra Virtuala, SIA' });
    });

    it('should parse number', async () => {
        try {
            const js = await new XmlObject('<name>456</name>').js();
            expect(js).toStrictEqual({ name: 456 });
        } catch (error) {
            expect(error).toMatch('error');
        }
    });

    it('should parse boolean', async () => {
        const js = await (new XmlObject('<name>false</name>')).js();
        expect(js).toStrictEqual({ name: false });
    });

    it('should not parse ignored key', async () => {
        const js = await (new XmlObject('<RegNumber>456</RegNumber>')).js();
        expect(js).toStrictEqual({ regNumber: '456' });
    });

    it('should parse sample xml to object', async () => {
        const jsObj = await xmlObject.js();
        expect(jsObj).toStrictEqual(clientObj);
    });
});
