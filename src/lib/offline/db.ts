import Dexie, { type Table } from 'dexie';

export interface OfflineProduct {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    barcode: string | null;
    category: string | null;
    unit: string;
}

export interface PendingInvoice {
    id?: number;
    data: any; // The invoice payload
    status: 'pending' | 'synced' | 'error';
    timestamp: number;
}

export class StockSewaDB extends Dexie {
    products!: Table<OfflineProduct>;
    pendingInvoices!: Table<PendingInvoice>;

    constructor() {
        super('StockSewaOffline');
        this.version(1).stores({
            products: 'id, name, barcode, category',
            pendingInvoices: '++id, status, timestamp'
        });
    }
}

export const db = new StockSewaDB();
