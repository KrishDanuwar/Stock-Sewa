import { getProducts } from '@/lib/actions/products';
import { getCustomers } from '@/lib/actions/customers';
import { getOrganization } from '@/lib/actions/organizations';
import POSClient from './POSClient';

export default async function POSPage() {
    const [products, customers, organization] = await Promise.all([
        getProducts(),
        getCustomers(),
        getOrganization()
    ]);
    return <POSClient products={products} customers={customers} organization={organization} />;
}
