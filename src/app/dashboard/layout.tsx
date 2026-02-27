import Sidebar from '@/components/Sidebar';
import { getOrgContext } from '@/lib/org-context';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isTrialExpired, subscriptionStatus, trialEndsAt, subscriptionPlan } = await getOrgContext();

    // Block access if trial is expired and status isn't active
    if (isTrialExpired && subscriptionStatus !== 'active') {
        redirect('/trial-expired');
    }

    return (
        <div className="page-wrapper">
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
