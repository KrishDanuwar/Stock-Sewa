'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getOrganization() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();

    if (!profile) return null;

    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

    return org;
}
