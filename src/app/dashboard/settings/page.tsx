import { getOrganization } from '@/lib/actions/organizations';
import { getOrgContext } from '@/lib/org-context';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const organization = await getOrganization();
    const context = await getOrgContext();

    return (
        <SettingsClient
            organization={organization}
            userEmail={context.email}
            subscriptionPlan={context.subscriptionPlan}
            subscriptionStatus={context.subscriptionStatus}
            trialEndsAt={context.trialEndsAt}
            subscriptionEndsAt={context.subscriptionEndsAt}
        />
    );
}
