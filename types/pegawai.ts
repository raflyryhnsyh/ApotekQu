export type ObatMaster = {
    id: string
    nama: string
    kategori: string
    satuan: string
    hargaJual: number
    komposisi: string
}

export type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
}

export type CartItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export type Transaction = {
    id: string;
    date: string;
    pharmacist: string;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}