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
      shippingData: {
        shippingType: number;
        warehouse: {
          warehouseID: number;
        };
        loadingArea: {
          loadingAreaID: string;
        };
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
