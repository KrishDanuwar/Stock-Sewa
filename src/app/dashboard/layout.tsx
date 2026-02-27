import Sidebar from '@/components/Sidebar';
import { getOrgContext } from '@/lib/org-context';
import { redirect } from 'next/navigation';
import { TrialBanner } from '@/components/TrialBanner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isTrialExpired, subscriptionStatus, trialEndsAt, subscriptionPlan } = await getOrgContext();

    // Block access if trial is expired and status isn't active
    if (isTrialExpired && subscriptionStatus !== 'active') {
        redirect('/trial-expired');
    }

    // Calculate days remaining
    const now = new Date();
    const ends = trialEndsAt ? new Date(trialEndsAt) : now;
    const diffTime = Math.max(0, ends.getTime() - now.getTime());
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="page-wrapper">
            {subscriptionPlan === 'trial' && subscriptionStatus === 'active' && daysRemaining > 0 && (
                <TrialBanner daysRemaining={daysRemaining} />
            )}
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
