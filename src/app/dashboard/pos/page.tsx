import { getProducts } from '@/lib/actions/products';
import { getCustomers } from '@/lib/actions/customers';
import { getOrganization } from '@/lib/actions/organizations';
import { getOrgContext } from '@/lib/org-context';
import POSClient from './POSClient';

export default async function POSPage() {
    const [products, customers, organization, { plan }] = await Promise.all([
        getProducts(),
        getCustomers(),
        getOrganization(),
        getOrgContext()
    ]);

    return (
        <POSClient
            products={products}
            customers={customers}
            organization={organization}
            plan={plan}
        />
    );
}
