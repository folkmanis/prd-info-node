export interface PaytraqClientObject {
  clientID: number;
  name: string;
  email?: string;
  type: number;
  status: number;
  regNumber: string;
  vatNumber?: string;
  legalAddress: {
    address: string;
    zip: string;
    country: string;
  };
  phone?: string;
  financialData?: {
    creditLimit: number;
    deposit: number;
    discount: number;
    payTerm: {
      payTermType: number;
      payTermDays: number;
    };
  };
  clientGroup: {
    groupID?: number;
    groupName?: string;
  };
  timeStamps: {
    created: string;
    updated: string;
  };
}

export interface PaytraqClient {
  client: PaytraqClientObject;
}

export interface PaytraqClients {
  clients: PaytraqClient[];
}

export interface ShippingAddressObject {
  addressID: number;
  shipTo: string;
  address: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface ShippingAddress {
  shippingAddress: ShippingAddressObject;
}

export interface ShippingAddresses {
  shippingAddresses: ShippingAddress[];
}
