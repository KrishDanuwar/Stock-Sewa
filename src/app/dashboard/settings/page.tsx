import { getOrganization } from '@/lib/actions/organizations';
import { getOrgContext } from '@/lib/org-context';
import SettingsClient from './SettingsClient';

import { isAuthorizedAdmin } from '@/lib/actions/admin-management';

export default async function SettingsPage() {
    const organization = await getOrganization();
    const context = await getOrgContext();
    const isAdmin = await isAuthorizedAdmin();

    return (
        <SettingsClient
            organization={organization}
            userEmail={context.email}
            subscriptionPlan={context.subscriptionPlan}
            subscriptionStatus={context.subscriptionStatus}
            trialEndsAt={context.trialEndsAt}
            subscriptionEndsAt={context.subscriptionEndsAt}
            plan={context.plan}
            isSiteAdmin={isAdmin}
        />
    );
}
