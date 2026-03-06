'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getAdminEmails() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('site_admins')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) return [];
    return data;
}

export async function isAuthorizedAdmin() {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) return false;

    // Hardcoded fallback for the primary admin to ensure they can never be locked out
    const PRIMARY_ADMIN = process.env.SYSTEM_OWNER_EMAIL || process.env.NEXT_PUBLIC_SYSTEM_OWNER_EMAIL;
    if (email === PRIMARY_ADMIN) return true;

    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('site_admins')
        .select('email')
        .eq('email', email)
        .single();

    return !!data && !error;
}

export async function addAdminEmail(email: string) {
    // Only existing admins can add new ones
    const isAuthorized = await isAuthorizedAdmin();
    if (!isAuthorized) throw new Error('Unauthorized');

    const supabase = await createAdminClient();
    const { error } = await supabase
        .from('site_admins')
        .insert({ email: email.toLowerCase().trim() });

    if (error) return { error: error.message };
    revalidatePath('/admin/management');
    return { success: true };
}

export async function removeAdminEmail(id: string) {
    const isAuthorized = await isAuthorizedAdmin();
    if (!isAuthorized) throw new Error('Unauthorized');

    const supabase = await createAdminClient();
    const { error } = await supabase
        .from('site_admins')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/management');
    return { success: true };
}
