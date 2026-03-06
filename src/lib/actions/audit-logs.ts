'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { isAuthorizedAdmin } from './admin-management';

export async function getAuditLogs(limit = 50, offset = 0) {
    try {
        if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');

        const supabase = await createAdminClient();
        const { data, error, count } = await supabase
            .from('security_audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return { logs: data, total: count || 0 };
    } catch (err: any) {
        console.error('Failed to fetch audit logs:', err);
        return { error: err.message || 'Failed to fetch audit logs' };
    }
}
