'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function repairOrganization(prevState: any, formData: FormData) {
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
        console.log('Profile already exists for user:', user.id);
        redirect('/dashboard');
    }

    // 3. Extract metadata for repair
    console.log('--- Repair Attempting ---');
    console.log('User ID:', user.id);
    console.log('User Metadata:', user.user_metadata);

    const orgName = user.user_metadata?.org_name || 'My Organization';
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';

    console.log(`Attempting repair for ${user.id} (Org: ${orgName}, User: ${username})`);

    try {
        // 4. Call repair RPC (bypasses RLS since it is SECURITY DEFINER)
        console.log('Calling RPC: repair_user_org_v2...');
        const { data: rpcMessage, error: rpcError } = await supabase.rpc('repair_user_org_v2', {
            target_user_id: user.id,
            org_name: orgName,
            username_val: username
        });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            throw rpcError;
        }

        console.log('RPC result message:', rpcMessage);

        if (rpcMessage && rpcMessage.startsWith('ERROR:')) {
            throw new Error(rpcMessage);
        }

        console.log('Repair logic successful, redirecting to /dashboard');
        redirect('/dashboard');

    } catch (error: any) {
        // Handle redirect errors so Next.js can process them
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error('Repair Action Exception:', error);
        return {
            error: error?.message || 'Repair failed. Please ensure you ran the SQL snippet in Supabase SQL Editor.'
        };
    }
}
