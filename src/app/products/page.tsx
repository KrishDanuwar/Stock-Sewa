import { getProducts } from '@/lib/actions/products';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { search?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
    let products: any[] = [];
    try {
        products = await getProducts(searchParams.search);
    } catch (e) {
        // Supabase not configured
    }

    return <ProductsClient initialProducts={products} />;
}
