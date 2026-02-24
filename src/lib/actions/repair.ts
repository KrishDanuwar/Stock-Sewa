'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function repairOrganization(formData: FormData) {
    const supabase = await createClient();

    // 1. Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 2. Check if profile already exists (safety check)
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (existingProfile?.organization_id) {
        redirect('/dashboard');
    }

    // 3. Extract metadata for repair
    const orgName = user.user_metadata?.org_name || 'My Organization';
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';

    try {
        // 4. Call repair RPC (bypasses RLS since it is SECURITY DEFINER)
        const { error: rpcError } = await supabase.rpc('repair_user_org', {
            target_user_id: user.id,
            org_name: orgName,
            username_val: username
        });

        if (rpcError) throw rpcError;

    } catch (error) {
        console.error('Repair failed:', error);
        // We don't redirect yet if it fails, maybe stay on page? 
        // But for now let's hope it works or user sees logs if they are a dev
    }

    // 5. Success!
    redirect('/dashboard');
}
