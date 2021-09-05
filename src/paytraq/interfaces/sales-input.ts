export interface SalesInput {
  data: {
    sale: {
      header: {
        document: {
          client: {
            clientID: number;
          };
        };
        saleType: 'sales_invoice';
        operation: 'sell_goods';
      };
      lineItems: {
        lineItem: [
          {
            item: {
              itemID: number;
            };
            qty: number;
            price: number;
          },
        ];
      };
    };
  };
}
