import { getAuditLogs } from '@/lib/actions/audit-logs';
import AuditLogsClient from './AuditLogsClient';
import { isAuthorizedAdmin } from '@/lib/actions/admin-management';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Security Audit Logs | Admin Dashboard',
};

export default async function AuditLogsPage() {
    const isAuthorized = await isAuthorizedAdmin();
    if (!isAuthorized) {
        redirect('/');
    }

    const { logs, total, error } = await getAuditLogs(50, 0);

    return (
        <AuditLogsClient
            initialLogs={logs || []}
            totalLogs={total || 0}
            error={error}
        />
    );
}
