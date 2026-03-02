import Sidebar from '@/components/Sidebar';
import { getOrgContext } from '@/lib/org-context';
import { redirect } from 'next/navigation';
import { isAuthorizedAdmin } from '@/lib/actions/admin-management';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isTrialExpired, subscriptionStatus } = await getOrgContext();

    // Redirect admin users to admin panel
    const isAdmin = await isAuthorizedAdmin();
    if (isAdmin) {
        redirect('/admin');
    }

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
