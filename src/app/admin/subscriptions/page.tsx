import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import AdminSubscriptionsClient from './AdminSubscriptionsClient';

export default async function AdminSubscriptionsPage() {
    const { userId } = await auth();
    const user = await currentUser();

    // Protection: Only junsangsingh@gmail.com can access this
    const ADMIN_EMAILS = ['junsangsingh@gmail.com'];

    const userEmail = user?.emailAddresses[0]?.emailAddress || '';
    if (!user || !ADMIN_EMAILS.includes(userEmail)) {
        console.warn(`Unauthorized admin access attempt by: ${userEmail}`);
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
