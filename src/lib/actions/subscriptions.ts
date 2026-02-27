'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { getPlanConfig } from '@/config/plans';

const AUTHORIZED_ADMIN = 'junsangsingh@gmail.com';

export async function submitTransactionId(transactionId: string, plan: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('organizations')
        .update({
            last_transaction_id: transactionId,
            subscription_status: 'pending',
            subscription_plan: plan,
        })
        .eq('id', organizationId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/trial-expired');
    return { success: true };
}

export async function activateSubscription(orgId: string, plan: string) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (email !== AUTHORIZED_ADMIN) {
        throw new Error('Unauthorized');
    }

    const supabase = await createAdminClient();

    // Use configuration for duration
    const planConfig = getPlanConfig(plan);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.durationDays);

    const { error } = await supabase
        .from('organizations')
        .update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_ends_at: expiryDate.toISOString(),
            last_transaction_id: null, // Clear after activation
        })
        .eq('id', orgId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/subscriptions');
    return { success: true };
}

export async function rejectSubscription(orgId: string) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (email !== AUTHORIZED_ADMIN) {
        throw new Error('Unauthorized');
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('organizations')
        .update({
            subscription_status: 'inactive',
            last_transaction_id: null,
        })
        .eq('id', orgId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/subscriptions');
    return { success: true };
}
