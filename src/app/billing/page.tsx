import { getOrgContext } from '@/lib/org-context';
import BillingClient from './BillingClient';

export default async function BillingPage() {
    const ctx = await getOrgContext();
    if (!ctx) return null;

    return (
        <BillingClient
            subscriptionStatus={ctx.subscriptionStatus}
            organizationName={ctx.organizationName}
        />
    );
}
