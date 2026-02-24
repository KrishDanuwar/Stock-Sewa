import { getProducts } from '@/lib/actions/products';
import { getCustomers } from '@/lib/actions/customers';
import POSClient from './POSClient';

export default async function POSPage() {
    const [products, customers] = await Promise.all([getProducts(), getCustomers()]);
    return <POSClient products={products} customers={customers} />;
}
