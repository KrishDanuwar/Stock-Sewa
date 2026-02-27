import React from 'react';
import { getAdminEmails, isAuthorizedAdmin } from '@/lib/actions/admin-management';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
    // Protection: Only site admins can access this page
    const isAuthorized = await isAuthorizedAdmin();

    if (!isAuthorized) {
        redirect('/dashboard');
    }

    // Fetch Admin Emails
    const admins = await getAdminEmails();

    // Fetch Organizations for Subscriptions
    const supabase = await createAdminClient();
    const { data: organizations, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="p-10 text-red-500 glass-card mx-auto max-w-4xl mt-10">
                <h1 className="text-xl font-bold mb-4">Core System Error</h1>
                <p>Failed to load system organizations: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <AdminDashboardClient
                initialAdmins={admins}
                initialOrgs={organizations || []}
            />
        </div>
    );
}
