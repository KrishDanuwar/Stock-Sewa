import { getStockMovements } from '@/lib/actions/stock';
import StockClient from './StockClient';

export const dynamic = 'force-dynamic';

export default async function StockPage() {
    let movements: any[] = [];
    try {
        movements = await getStockMovements();
    } catch (e) {
        // Supabase not configured
    }

    return <StockClient initialMovements={movements} />;
}
