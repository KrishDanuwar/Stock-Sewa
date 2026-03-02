import React from 'react';
import { getAdminEmails, isAuthorizedAdmin } from '@/lib/actions/admin-management';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { getPlans } from '@/lib/actions/plan-management';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
    const isAuthorized = await isAuthorizedAdmin();

    if (!isAuthorized) {
        redirect('/dashboard');
    }

    const admins = await getAdminEmails();
    const plans = await getPlans();

    const supabase = await createAdminClient();
    const { data: organizations, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="p-10 text-red-500 glass-card mx-auto max-w-4xl mt-10">
                <h1 className="text-xl font-bold mb-4">System Error</h1>
                <p>Failed to load organizations: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <AdminDashboardClient
                initialAdmins={admins}
                initialOrgs={organizations || []}
                initialPlans={plans}
            />
        </div>
    );
}
