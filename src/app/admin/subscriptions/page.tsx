import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import AdminSubscriptionsClient from './AdminSubscriptionsClient';

import { isAuthorizedAdmin } from '@/lib/actions/admin-management';

export default async function AdminSubscriptionsPage() {
    // Protection: Only authorized admins can access this
    const isAuthorized = await isAuthorizedAdmin();

    if (!isAuthorized) {
        redirect('/dashboard');
    }

    const supabase = await createAdminClient();

    const { data: organizations, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-10 text-red-500">Error loading subscriptions: {error.message}</div>;
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <AdminSubscriptionsClient initialOrgs={organizations || []} />
        </div>
    );
}
