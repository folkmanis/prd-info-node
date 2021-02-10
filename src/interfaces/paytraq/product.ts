export interface PaytraqProductObject {
    [key: string]: string;
}

export interface PaytraqProduct {
    product: PaytraqProductObject;
}

export interface PaytraqProducts {
    products: PaytraqProduct[];
}
