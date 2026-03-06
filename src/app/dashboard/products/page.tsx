import { getProducts } from '@/lib/actions/products';
import { getOrgContext } from '@/lib/org-context';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
    const products = await getProducts();
    const { plan } = await getOrgContext();
    return <ProductsClient products={products} plan={plan} />;
}
