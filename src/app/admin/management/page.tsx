import React from 'react';
import { getAdminEmails, isAuthorizedAdmin } from '@/lib/actions/admin-management';
import { redirect } from 'next/navigation';
import AdminManagementClient from './AdminManagementClient';

export default async function AdminManagementPage() {
    // Protection: Only site admins can access this page
    const isAuthorized = await isAuthorizedAdmin();

    if (!isAuthorized) {
        redirect('/dashboard');
    }

    const admins = await getAdminEmails();

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto">
            <AdminManagementClient initialAdmins={admins} />
        </div>
    );
}
