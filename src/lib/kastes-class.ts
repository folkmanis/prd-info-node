export interface KastesVeikals {
    kods: string,
    adrese: string,
    pasutijums: string,
    gatavs: boolean,
    uzlime: boolean,
    kastes: {
        yellow: number,
        rose: number,
        white: number,
    }[],
}

export interface KastesPasutijums {
    id: number,
    name: string,
    deleted: boolean,
}