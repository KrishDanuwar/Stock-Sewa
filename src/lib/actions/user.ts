'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function deleteAccount(confirmation: string) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return { error: 'Unauthorized' };
    }

    if (confirmation !== 'DELETE MY DATA') {
        return { error: 'Invalid confirmation string' };
    }

    const supabase = await createAdminClient();

    // 1. Get organization_id
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        return { error: 'Could not find profile or organization' };
    }

    const organizationId = profile.organization_id;

    try {
        // 2. Delete all data associated with the organization
        // We delete in order of dependency
        await supabase.from('invoice_items').delete().eq('organization_id', organizationId);
        await supabase.from('stock_movements').delete().eq('organization_id', organizationId);
        await supabase.from('invoices').delete().eq('organization_id', organizationId);
        await supabase.from('customers').delete().eq('organization_id', organizationId);
        await supabase.from('products').delete().eq('organization_id', organizationId);
        await supabase.from('profiles').delete().eq('organization_id', organizationId);
        await supabase.from('organizations').delete().eq('id', organizationId);

        // 3. Delete user from Clerk
        const client = await clerkClient();
        await client.users.deleteUser(userId);

        return { success: true };
    } catch (err: any) {
        console.error('Account deletion error:', err);
        return { error: err.message || 'An unexpected error occurred during deletion' };
    }
}
